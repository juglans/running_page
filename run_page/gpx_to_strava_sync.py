import argparse
import os
import time
from datetime import datetime

import gpxpy as mod_gpxpy
from config import GPX_FOLDER
from strava_sync import run_strava_sync
from stravalib.exc import ActivityUploadFailed, RateLimitTimeout
from utils import get_strava_last_time, make_strava_client, upload_file_to_strava


def get_gpx_distance(gpx):
    """Calculate total distance from GPX file in meters."""
    total_distance = 0
    for track in gpx.tracks:
        for segment in track.segments:
            for i in range(1, len(segment.points)):
                prev_point = segment.points[i - 1]
                curr_point = segment.points[i]
                total_distance += prev_point.distance_2d(curr_point)
    return total_distance


def get_to_generate_files(last_time):
    """
    reuturn to values one dict for upload
    and one sorted list for next time upload
    """
    file_names = os.listdir(GPX_FOLDER)
    gpx_files = []
    for f in file_names:
        if f.endswith(".gpx"):
            file_path = os.path.join(GPX_FOLDER, f)
            with open(file_path, "r", encoding="utf-8", errors="ignore") as r:
                try:
                    gpx = mod_gpxpy.parse(r)
                except Exception as e:
                    print(f"Something is wring with {file_path} err: {str(e)}")
                    continue
                if gpx.get_time_bounds()[0]:
                    gpx_files.append((gpx, file_path))
    gpx_files_dict = {
        int(i[0].get_time_bounds()[0].timestamp()): {
            'path': i[1],
            'start_time': i[0].get_time_bounds()[0].timestamp(),
            'start_datetime': i[0].get_time_bounds()[0],
            'distance': get_gpx_distance(i[0]),
        }
        for i in gpx_files
        if int(i[0].get_time_bounds()[0].timestamp()) > last_time
    }
    return sorted(list(gpx_files_dict.keys())), gpx_files_dict


def check_duplicate_on_strava(client, gpx_start_datetime, gpx_distance):
    """
    Check if GPX activity already exists on Strava.
    
    Duplicate check conditions:
    1. Same year-month-day-hour-minute (精确到分钟)
    2. Time difference < 60 seconds
    3. Distance difference < 5%
    
    Returns:
        True: Duplicate found, skip upload
        False: No duplicate, proceed with upload
    """
    activities = list(client.get_activities(limit=5))
    gpx_minute = gpx_start_datetime.strftime("%Y-%m-%d %H:%M")
    
    for activity in activities:
        if activity.type != "Run":
            continue
        
        strava_minute = activity.start_date.strftime("%Y-%m-%d %H:%M")
        if gpx_minute != strava_minute:
            continue
        
        strava_time = activity.start_date.timestamp()
        strava_distance = activity.distance
        
        time_diff = abs(gpx_start_datetime.timestamp() - strava_time)
        if time_diff >= 60:
            continue
        
        distance_diff = abs(gpx_distance - strava_distance) / max(strava_distance, 1)
        if distance_diff >= 0.05:
            continue
        
        print(f"  ⏭️  Skip duplicate: minute={strava_minute}, time_diff={time_diff}s, distance_diff={distance_diff:.1%}")
        return True
    
    return False


if __name__ == "__main__":
    if not os.path.exists(GPX_FOLDER):
        os.mkdir(GPX_FOLDER)
    parser = argparse.ArgumentParser()
    parser.add_argument("client_id", help="strava client id")
    parser.add_argument("client_secret", help="strava client secret")
    parser.add_argument("strava_refresh_token", help="strava refresh token")
    parser.add_argument(
        "--all",
        dest="all",
        action="store_true",
        help="if upload to strava all without check last time",
    )
    options = parser.parse_args()
    print("Need to load all gpx files maybe take some time")
    last_time = 0
    client = make_strava_client(
        options.client_id, options.client_secret, options.strava_refresh_token
    )
    if not options.all:
        last_time = get_strava_last_time(client, is_milliseconds=False)
    to_upload_time_list, to_upload_dict = get_to_generate_files(last_time)
    index = 1
    print(f"{len(to_upload_time_list)} gpx files is going to upload")
    for i in to_upload_time_list:
        gpx_info = to_upload_dict[i]
        gpx_file = gpx_info['path']
        gpx_start_datetime = gpx_info['start_datetime']
        gpx_distance = gpx_info['distance']
        
        if check_duplicate_on_strava(client, gpx_start_datetime, gpx_distance):
            continue
        
        try:
            upload_file_to_strava(client, gpx_file, "gpx")
        except RateLimitTimeout as e:
            timeout = e.timeout
            print(f"Strava API Rate Limit Timeout. Retry in {timeout} seconds\n")
            time.sleep(timeout)
            upload_file_to_strava(client, gpx_file, "gpx")

        except ActivityUploadFailed as e:
            print(f"Upload faild error {str(e)}")
        time.sleep(1)

    # 暂停从gpx同步到strava的反向回写过程，导致数据重复
    # time.sleep(10)
    # run_strava_sync(
    #     options.client_id, options.client_secret, options.strava_refresh_token
    # )
