import { createSelector, createSlice } from '@reduxjs/toolkit';

const name = 'dataLayer';

const MAP_STYLES = [
  {
    label: 'Satellite Streets',
    thumbnail: '/satellite.png',
    uri: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  {
    label: 'Streets',
    thumbnail: '/streets.png',
    uri: 'mapbox://styles/mapbox/streets-v12',
  },
  {
    label: 'Outdoors',
    thumbnail: '/outdoors.png',
    uri: 'mapbox://styles/mapbox/outdoors-v12',
  },
  {
    label: 'Navigation',
    thumbnail: '/navigation.png',
    uri: 'mapbox://styles/mapbox/navigation-day-v1',
  },
  {
    label: 'Terrain',
    thumbnail: '/terrain.png',
    uri: 'mapbox://styles/astrosat/clcq9le7w003k14qspiwt4837',
  },
];

export const initialState = {
  selectedFireBreak: null,
  mapStyles: MAP_STYLES,
  selectedMapStyle: MAP_STYLES[0],
  error: false,
};

const appSlice = createSlice({
  name,
  initialState,
  reducers: {
    setSelectedFireBreak: (state, { payload }) => {
      state.selectedFireBreak = payload;
      state.error = false;
    },
    setSelectedMapStyle: (state, { payload }) => {
      state.selectedMapStyle = payload;
    },
  },
});

export const { setSelectedFireBreak, setSelectedMapStyle } = appSlice.actions;

const baseSelector = (state) => state?.app;

export const errorSelector = createSelector(baseSelector, (app) => app?.error);

export const selectedFireBreakSelector = createSelector(
  baseSelector,
  (app) => app?.selectedFireBreak,
);

export const selectedMapStyleSelector = createSelector(
  baseSelector,
  (app) => app?.selectedMapStyle,
);

export const mapStylesSelector = createSelector(
  baseSelector,
  (app) => app?.mapStyles,
);

export default appSlice.reducer;
