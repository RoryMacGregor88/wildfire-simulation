import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '~/store';

import {
  INITIAL_VIEW_STATE,
  MapContext,
  MapProvider,
  useMap,
} from './map-context/map-context';

export { INITIAL_VIEW_STATE };

/** Use throughout app instead of default `useDispatch` and `useSelector` */
const useAppDispatch: () => AppDispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { MapContext, MapProvider, useMap, useAppDispatch, useAppSelector };
