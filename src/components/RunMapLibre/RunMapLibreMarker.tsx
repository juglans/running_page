import { ReactComponent as EndSvg } from '@assets/end.svg';
import { ReactComponent as StartSvg } from '@assets/start.svg';
import { Marker } from 'react-map-gl/maplibre';
import styles from './style.module.scss';

interface IRunMapLibreMarkerProperties {
  startLon: number;
  startLat: number;
  endLon: number;
  endLat: number;
}

const RunMapLibreMarker = ({
  startLon,
  startLat,
  endLon,
  endLat,
}: IRunMapLibreMarkerProperties) => {
  const size = 5;

  return (
    <>
      <Marker
        key="marker-start"
        longitude={startLon}
        latitude={startLat}
        anchor="bottom"
      >
        <div
          style={{
            transform: `translate(${-size / 2}px,${-size}px)`,
            maxWidth: '25px',
          }}
        >
          <StartSvg className={styles.locationSVG} />
        </div>
      </Marker>
      <Marker
        key="marker-end"
        longitude={endLon}
        latitude={endLat}
        anchor="bottom"
      >
        <div
          style={{
            transform: `translate(${-size / 2}px,${-size}px)`,
            maxWidth: '25px',
          }}
        >
          <EndSvg className={styles.locationSVG} />
        </div>
      </Marker>
    </>
  );
};

export default RunMapLibreMarker;
