import React, { useCallback } from 'react';
import Map, {
  Layer,
  Source,
  FullscreenControl,
  NavigationControl,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useActivities from '@/hooks/useActivities';
import {
  IS_CHINESE,
  MAIN_COLOR,
  PROVINCE_FILL_COLOR,
  USE_DASH_LINE,
  LINE_OPACITY,
  MAP_HEIGHT,
} from '@/utils/const';
import { Coordinate, IViewState, geoJsonForMap } from '@/utils/utils';
import { FeatureCollection } from 'geojson';
import { RPGeometry } from '@/static/run_countries';
import RunMapButtons from './RunMapLibreButtons';
import RunMapLibreMarker from './RunMapLibreMarker';
import styles from './style.module.scss';

interface IRunMapLibreProps {
  title: string;
  viewState: IViewState;
  setViewState: (_viewState: IViewState) => void;
  changeYear: (_year: string) => void;
  geoData: FeatureCollection<RPGeometry>;
  thisYear: string;
}

// CARTO Dark Matter style (free, no token required)
const CARTO_DARK_STYLE =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const RunMapLibre = ({
  title,
  viewState,
  setViewState,
  changeYear,
  geoData,
  thisYear,
}: IRunMapLibreProps) => {
  const { provinces } = useActivities();

  const onMove = useCallback(
    ({ viewState: newViewState }: { viewState: IViewState }) => {
      setViewState(newViewState);
    },
    [setViewState]
  );

  const isBigMap = (viewState.zoom ?? 0) <= 3;
  // Keep the original geoData for routes, use chinaGeojson for province fill layer
  const displayData = geoData;

  const isSingleRun =
    displayData.features.length === 1 &&
    displayData.features[0].geometry.coordinates.length;

  let startLon = 0;
  let startLat = 0;
  let endLon = 0;
  let endLat = 0;

  if (isSingleRun) {
    const points = displayData.features[0].geometry.coordinates as Coordinate[];
    [startLon, startLat] = points[0];
    [endLon, endLat] = points[points.length - 1];
  }

  const dash = USE_DASH_LINE && !isSingleRun ? [2, 2] : [2, 0];

  const style: React.CSSProperties = {
    width: '100%',
    height: MAP_HEIGHT,
  };

  const fullscreenButton: React.CSSProperties = {
    position: 'absolute',
    marginTop: '29.2px',
    right: '10px',
    opacity: 0.3,
  };

  return (
    <Map
      {...viewState}
      onMove={onMove}
      style={style}
      mapStyle={CARTO_DARK_STYLE}
    >
      <RunMapButtons changeYear={changeYear} thisYear={thisYear} />

      {/* Province fill layer - only show on big map */}
      {isBigMap && IS_CHINESE && provinces.length > 0 && (
        <Source id="province-source" type="geojson" data={geoJsonForMap()}>
          <Layer
            id="province-fill"
            type="fill"
            paint={{
              'fill-color': PROVINCE_FILL_COLOR,
              'fill-opacity': 0.3,
            }}
            filter={['in', 'name', ...provinces]}
          />
        </Source>
      )}

      {/* Running routes layer */}
      <Source id="routes-source" type="geojson" data={displayData}>
        <Layer
          id="routes-layer"
          type="line"
          paint={{
            'line-color': MAIN_COLOR,
            'line-width': isBigMap ? 1 : 2,
            'line-dasharray': dash,
            'line-opacity': isSingleRun ? 1 : LINE_OPACITY,
            'line-blur': 1,
          }}
          layout={{
            'line-join': 'round',
            'line-cap': 'round',
          }}
        />
      </Source>

      {/* Start/End markers for single run */}
      {isSingleRun && (
        <RunMapLibreMarker
          startLat={startLat}
          startLon={startLon}
          endLat={endLat}
          endLon={endLon}
        />
      )}

      <span className={styles.runTitle}>{title}</span>
      <FullscreenControl style={fullscreenButton} />
      <NavigationControl
        showCompass={false}
        position="bottom-right"
        style={{ opacity: 0.3 }}
      />
    </Map>
  );
};

export default RunMapLibre;
