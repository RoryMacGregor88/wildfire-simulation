import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

export const INITIAL_VIEW_STATE = {
  longitude: 9.56005296,
  latitude: 43.02777403,
  zoom: 4,
  bearing: 0,
  pitch: 0,
};

export const MapContext = createContext(undefined);
MapContext.displayName = 'MapContext';

/**
 * @typedef {Object} MapContextType
 * @property {React.MutableRefObject<import('react-map-gl').StaticMap>} mapRef
 * @property {React.MutableRefObject<import('@deck.gl/core').Deck>} deckRef
 */

/**
 * @param {{children: React.ReactNode}} props
 * @returns {JSX.Element} MapContextProvider
 */
// eslint-disable-next-line react/prop-types
export const MapProvider = (props) => {
  const mapRef = useRef(null);
  const deckRef = useRef(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const updateViewState = useCallback(
    (newViewState) =>
      setViewState((currentViewState) => ({
        ...currentViewState,
        ...newViewState,
      })),
    []
  );

  return (
    <MapContext.Provider
      value={{
        mapRef,
        deckRef,
        viewState,
        setViewState,
        updateViewState,
      }}
      {...props}
    />
  );
};

/**
 * @returns {{
 *   mapRef: React.MutableRefObject<import('react-map-gl').StaticMap>
 *   deckRef: React.MutableRefObject<import('@deck.gl/core').Deck>
 * }}
 */
export const useMap = () => {
  /**
   * @type {MapContextType}
   */
  const context = useContext(MapContext);

  if (context === undefined)
    throw Error('App must be wrapped with <MapProvider />');

  return context;
};
