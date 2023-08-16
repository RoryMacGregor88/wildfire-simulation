import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { MapContextValue, ViewState } from '~/types';

export const INITIAL_VIEW_STATE = {
  longitude: 9.56005296,
  latitude: 43.02777403,
  zoom: 4,
  bearing: 0,
  pitch: 0,
};

export const MapContext = createContext(undefined);
MapContext.displayName = 'MapContext';

interface Props {
  children: ReactNode;
}

export const MapProvider = ({ children }: Props) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const updateViewState = useCallback(
    (newViewState: Partial<ViewState>) =>
      setViewState((currentViewState) => ({
        ...currentViewState,
        ...newViewState,
      })),
    [],
  );

  const value: MapContextValue = {
    viewState,
    updateViewState,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = (): MapContextValue => {
  /**
   * @type {MapContextType}
   */
  const context = useContext(MapContext);

  if (context === undefined)
    throw Error('App must be wrapped with <MapProvider />');

  return context;
};
