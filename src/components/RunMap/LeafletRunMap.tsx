import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import {
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  MAP_HEIGHT,
  MAIN_COLOR,
  USE_DASH_LINE,
  LINE_OPACITY,
  PROVINCE_FILL_COLOR,
  IS_CHINESE,
} from '@/utils/const';
import { Coordinate, IViewState, geoJsonForMap } from '@/utils/utils';
import { FeatureCollection } from 'geojson';
import { RPGeometry } from '@/static/run_countries';
import RunMapButtons from './RunMapButtons';
import styles from './style.module.scss';

interface IRunMapProps {
  title: string;
  viewState: IViewState;
  setViewState: (_viewState: IViewState) => void;
  changeYear: (_year: string) => void;
  geoData: FeatureCollection<RPGeometry>;
  thisYear: string;
}

const LeafletRunMap = ({
  title,
  viewState,
  setViewState,
  changeYear,
  geoData,
  thisYear,
}: IRunMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [viewState.latitude || 20, viewState.longitude || 20],
      zoom: viewState.zoom || 3,
      zoomControl: false,
    });

    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layersRef.current = layerGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return;

    const map = mapInstanceRef.current;
    const layerGroup = layersRef.current;
    if (layerGroup) {
      layerGroup.clearLayers();
    }

    const isBigMap = (viewState.zoom ?? 0) <= 3;
    let displayData = geoData;
    if (isBigMap && IS_CHINESE) {
      displayData = geoJsonForMap();
    }

    const isSingleRun =
      displayData.features.length === 1 &&
      displayData.features[0].geometry.coordinates.length;

    L.geoJSON(displayData, {
      style: () => ({
        color: MAIN_COLOR,
        weight: isBigMap ? 1 : 2,
        opacity: isSingleRun ? 1 : LINE_OPACITY,
        dashArray: USE_DASH_LINE && !isSingleRun ? '2, 2' : undefined,
      }),
    }).addTo(layerGroup!);

    if (isSingleRun) {
      const points = displayData.features[0].geometry
        .coordinates as Coordinate[];
      const [startLon, startLat] = points[0];
      const [endLon, endLat] = points[points.length - 1];

      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: `<svg viewBox="0 0 24 24" width="25" height="25" style="fill: #4CAF50; transform: translate(-12px, -25px);"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
        iconSize: [25, 25],
      });

      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: `<svg viewBox="0 0 24 24" width="25" height="25" style="fill: #F44336; transform: translate(-12px, -25px);"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
        iconSize: [25, 25],
      });

      L.marker([startLat, startLon], { icon: startIcon }).addTo(layerGroup!);
      L.marker([endLat, endLon], { icon: endIcon }).addTo(layerGroup!);

      map.fitBounds(
        [
          [startLat, startLon],
          [endLat, endLon],
        ],
        { padding: [50, 50] }
      );
    } else if (displayData.features.length > 0) {
      const bounds = L.geoJSON(displayData).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [geoData, viewState]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(
      [viewState.latitude || 20, viewState.longitude || 20],
      viewState.zoom || 3
    );
  }, [viewState]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      const newZoom = (viewState.zoom || 3) + 1;
      setViewState({ ...viewState, zoom: newZoom });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      const newZoom = (viewState.zoom || 3) - 1;
      setViewState({ ...viewState, zoom: newZoom });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: MAP_HEIGHT }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <RunMapButtons changeYear={changeYear} thisYear={thisYear} />
      <div
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '30px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            display: 'block',
            width: '30px',
            height: '30px',
            marginBottom: '5px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            display: 'block',
            width: '30px',
            height: '30px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          -
        </button>
      </div>
      <span className={styles.runTitle}>{title}</span>
    </div>
  );
};

export default LeafletRunMap;
