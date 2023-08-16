import { createSelector, createSlice } from '@reduxjs/toolkit';

import { AppState, FireBreakData, MapStyle, RootState } from '~/types';

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

export const initialState: AppState = {
  selectedFireBreak: null,
  mapStyles: MAP_STYLES,
  selectedMapStyle: MAP_STYLES[0],
  error: false,
};

const appSlice = createSlice({
  name,
  initialState,
  reducers: {
    setSelectedFireBreak: (
      state,
      { payload }: { payload: FireBreakData | null },
    ) => {
      state.selectedFireBreak = payload;
      state.error = false;
    },
    setSelectedMapStyle: (state, { payload }: { payload: MapStyle }) => {
      state.selectedMapStyle = payload;
    },
  },
});

export const { setSelectedFireBreak, setSelectedMapStyle } = appSlice.actions;

const baseSelector = ({ app }: RootState) => app;

export const errorSelector = createSelector(baseSelector, ({ error }) => error);

export const selectedFireBreakSelector = createSelector(
  baseSelector,
  ({ selectedFireBreak }) => selectedFireBreak,
);

export const selectedMapStyleSelector = createSelector(
  baseSelector,
  ({ selectedMapStyle }) => selectedMapStyle,
);

export const mapStylesSelector = createSelector(
  baseSelector,
  ({ mapStyles }) => mapStyles,
);

export default appSlice.reducer;
