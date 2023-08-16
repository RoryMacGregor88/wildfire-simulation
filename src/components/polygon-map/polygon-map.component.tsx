import React, { ReactNode, useState } from 'react';

import { Feature } from '@nebula.gl/edit-modes';
import MapGL, { FullscreenControl, NavigationControl } from 'react-map-gl';
import {
  DrawPolygonMode,
  EditingMode,
  Editor,
  RENDER_STATE,
} from 'react-map-gl-draw';

import { MapStyleSwitcher } from '~/components';
import {
  DRAW_TYPES,
  MAPBOX_TOKEN,
  MODES,
  NAV_CONTROL_POSITION,
  POINT_RADIUS,
  POLYGON_ERROR_COLOR,
  POLYGON_FILL_COLOR,
  POLYGON_LINE_COLOR,
  POLYGON_LINE_DASH,
  SCREEN_CONTROL_POSITION,
  TRANSPARENT_COLOR,
} from '~/components/polygon-map/constants';
import { FIRE_BREAK_STROKE_COLORS } from '~/constants';
import { useAppDispatch, useAppSelector, useMap } from '~/hooks';
import {
  mapStylesSelector,
  selectedMapStyleSelector,
  setSelectedMapStyle,
} from '~/store/app.slice';
import { FireBreakValue, MapStyle, ViewState } from '~/types';

interface MapControlButtonProps {
  top?: string;
  style?: { [key: string]: string };
  onClick: () => void;
  children: ReactNode;
}

interface MapEvent {
  selectedFeature: {
    type: 'Feature';
    properties: { id: string };
    geometry: Feature;
  };
  mapCoords: [number, number];
  screenCoords: [number, number];
}

type ModeId = string;

const MapControlButton = ({
  top = '90px',
  style = {},
  onClick,
  children,
}: MapControlButtonProps) => (
  <div style={{ position: 'absolute', top, right: '10px' }}>
    <div className='mapboxgl-ctrl mapboxgl-ctrl-group'>
      <button
        className='mapboxgl-ctrl-icon d-flex justify-content-center align-items-center'
        style={{ ...style }}
        type='button'
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  </div>
);

const getPosition = (position: string) => {
  const [y, x] = position.split('-');
  return {
    position: 'absolute',
    [y]: 10,
    [x]: 10,
  };
};

interface Props {
  coordinates: Feature[];
  setCoordinates: (feature: Feature[], areaIsValid?: boolean) => void;
  onSelect: (selectedId: string) => void;
  clearMap: () => void;
  isDrawingPolygon: boolean;
  validateArea: () => boolean;
}

const PolygonMap = ({
  coordinates,
  setCoordinates,
  onSelect,
  clearMap,
  isDrawingPolygon,
  validateArea,
}: Props) => {
  const { viewState, updateViewState } = useMap();

  const dispatch = useAppDispatch();

  const mapStyles = useAppSelector(mapStylesSelector);
  const selectedMapStyle = useAppSelector(selectedMapStyleSelector);

  const [mode, setMode] = useState<{
    modeId?: ModeId;
    modeHandler?: EditingMode | DrawPolygonMode | null;
  }>({});

  const [selectedFeatureData, setSelectedFeatureData] =
    useState<MapEvent | null>(null);

  const [areaIsValid, setAreaIsValid] = useState(true);

  const { modeId, modeHandler } = mode;

  const toggleMode = (value: ModeId) => {
    if (value === modeId) return;

    const newId = value ?? null,
      mode = MODES.find(({ id }) => id === newId),
      modeHandler = mode ? new mode.handler() : null;

    setMode({ modeId: newId, modeHandler });
  };

  const editToggle = (value: ModeId) => {
    if (value === DRAW_TYPES.LINE_STRING) {
      const isDrawingLineString = modeId === DRAW_TYPES.LINE_STRING;
      toggleMode(isDrawingLineString ? 'editing' : DRAW_TYPES.LINE_STRING);
    } else if (value === DRAW_TYPES.POLYGON) {
      /** clear map before drawig new polygon */
      if (coordinates.length) {
        setAreaIsValid(true);
        setCoordinates([]);
      }
      const isDrawingPolygon = modeId === DRAW_TYPES.POLYGON;
      toggleMode(isDrawingPolygon ? 'editing' : DRAW_TYPES.POLYGON);
    }
  };

  const handleClearMap = () => {
    setAreaIsValid(true);
    if (selectedFeatureData?.selectedFeature) {
      clearMap(selectedFeatureData);
    }
  };

  // TODO: is this what's causing need to double click icon?
  const selectedDrawType = isDrawingPolygon
    ? DRAW_TYPES.POLYGON
    : DRAW_TYPES.LINE_STRING;

  const isDrawTypeSelected = modeId === selectedDrawType;

  const handleUpdate = ({ data, editType }) => {
    if (editType === 'addFeature') {
      const areaIsValid = validateArea(data[0]);

      setAreaIsValid(areaIsValid);
      setCoordinates(data, areaIsValid);
      toggleMode('editing');
    } else if (editType === 'movePosition') {
      setCoordinates(data, areaIsValid);
    }
  };

  const handleSelectMapStyle = (mapStyle: MapStyle) => {
    dispatch(setSelectedMapStyle(mapStyle));
  };

  const handleSelect = (mapEvent: MapEvent) => {
    const { selectedFeature } = mapEvent;

    /**
     * onSelect sends the data to the component using the map,
     * setSelectedFeatureData sets the map's internal state for
     * displaying data
     */
    onSelect(selectedFeature.properties.id);
    setSelectedFeatureData(mapEvent);
  };

  const getfeatureStyle = ({ feature, state, index }) => {
    if (index === 0) setAreaIsValid(validateArea(feature));

    if (state === RENDER_STATE.SELECTED) {
      return {
        stroke: POLYGON_LINE_COLOR,
        fill: areaIsValid ? POLYGON_FILL_COLOR : POLYGON_ERROR_COLOR,
        r: POINT_RADIUS,
      };
    }

    const fireBreakType = feature.properties.fireBreakType as FireBreakValue;

    const stroke =
      FIRE_BREAK_STROKE_COLORS[fireBreakType] ?? POLYGON_LINE_COLOR;

    const defaultFeatureStyles = {
      stroke,
      fill: !areaIsValid ? POLYGON_ERROR_COLOR : POLYGON_FILL_COLOR,
      strokeDasharray: POLYGON_LINE_DASH,
      r: POINT_RADIUS,
      strokeWidth: 4,
    };

    /** Only polygons get fill colors */
    return feature.geometry.type === 'Polygon'
      ? defaultFeatureStyles
      : { ...defaultFeatureStyles, fill: TRANSPARENT_COLOR };
  };

  return (
    <>
      <MapGL
        {...viewState}
        height='100%'
        mapStyle={selectedMapStyle.uri}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        width='100%'
        onViewStateChange={({ viewState }: { viewState: ViewState }) =>
          updateViewState(viewState)
        }
      >
        <Editor
          clickRadius={12}
          featureStyle={getfeatureStyle}
          features={coordinates}
          /** Above 'modeHandler' type is correct, but Editor expects generic object */
          mode={modeHandler as Record<string, unknown> | undefined}
          onSelect={handleSelect}
          onUpdate={handleUpdate}
        />
        <MapStyleSwitcher
          mapStyles={mapStyles}
          updateMapStyle={handleSelectMapStyle}
        />

        <FullscreenControl style={getPosition(SCREEN_CONTROL_POSITION)} />

        <NavigationControl
          showCompass={false}
          style={getPosition(NAV_CONTROL_POSITION)}
        />

        <>
          <MapControlButton
            style={{ backgroundColor: isDrawTypeSelected ? 'lightgray' : '' }}
            top='50px'
            onClick={() => editToggle(selectedDrawType)}
          >
            <i
              className={`bx ${
                isDrawingPolygon ? 'bx-shape-triangle' : 'bx-minus'
              }`}
              style={{ fontSize: '20px' }}
            ></i>
          </MapControlButton>

          <MapControlButton onClick={handleClearMap}>
            <i className='bx bx-trash' style={{ fontSize: '20px' }}></i>
          </MapControlButton>
        </>
      </MapGL>
    </>
  );
};
export default PolygonMap;
