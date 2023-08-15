import {
  MapContext,
  MapProvider,
  useMap,
  INITIAL_VIEW_STATE,
} from './map-context/map-context';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '~/store';

export { INITIAL_VIEW_STATE };

/** Use throughout app instead of default `useDispatch` and `useSelector` */
const useAppDispatch: () => AppDispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { MapContext, MapProvider, useMap, useAppDispatch, useAppSelector };
