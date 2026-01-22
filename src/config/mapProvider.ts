export type MapProvider = 'mapbox' | 'openstreetmap';

export const MAP_PROVIDER: MapProvider = 'openstreetmap';

export const mapConfig = {
  provider: MAP_PROVIDER,
  osmTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  osmAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
