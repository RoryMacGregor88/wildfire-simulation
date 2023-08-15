import React, { useState } from 'react';

import { MapView } from '@deck.gl/core';
import MapGL, {
  FullscreenControl,
  NavigationControl,
  MapContext,
} from 'react-map-gl';
import {
  Editor,
  DrawPolygonMode,
  DrawLineStringMode,
  EditingMode,
  RENDER_STATE,
} from 'react-map-gl-draw';
import { MapStyleSwitcher } from '~/components';
import { useAppDispatch, useAppSelector, useMap } from '~/hooks';

import { FIRE_BREAK_STROKE_COLORS } from '~/constants';
import {
  selectedMapStyleSelector,
  mapStylesSelector,
  setSelectedMapStyle,
} from '~/store/app.slice';

const SCREEN_CONTROL_POSITION = '';
const NAV_CONTROL_POSITION = 'bottom-right';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const POLYGON_LINE_COLOR = 'rgb(26,115,232)';
const POLYGON_FILL_COLOR = 'rgba(255, 255, 255, 0.5)';
const POLYGON_LINE_DASH = '10,2';
const POLYGON_ERROR_COLOR = 'rgba(255, 0, 0, 0.5)';
const TRANSPARENT_COLOR = 'rgba(0, 0, 0, 0)';

const POINT_RADIUS = 8;

const getPosition = (position: string) => {
  const [y, x] = position.split('-');
  return {
    position: 'absolute',
    [y]: 10,
    [x]: 10,
  };
};

const PolygonMap = ({
  coordinates,
  setCoordinates,
  onSelect,
  clearMap,
  isDrawingPolygon,
  validateArea,
}) => {
  const { viewState, updateViewState } = useMap();

  const dispatch = useAppDispatch();

  const mapStyles = useAppSelector(mapStylesSelector);
  const selectedMapStyle = useAppSelector(selectedMapStyleSelector);

  const MODES = [
    { id: 'editing', text: 'Edit Feature', handler: EditingMode },
    { id: 'drawPolygon', text: 'Draw Polygon', handler: DrawPolygonMode },
    {
      id: 'drawLineString',
      text: 'Draw Line String',
      handler: DrawLineStringMode,
    },
  ];

  const DRAW_TYPES = {
    LINE_STRING: 'drawLineString',
    POLYGON: 'drawPolygon',
    EDITING: 'editing',
  };

  const [mode, setMode] = useState({});

  const [selectedFeatureData, setSelectedFeatureData] = useState(null);
  const [areaIsValid, setAreaIsValid] = useState(true);

  const { modeId, modeHandler } = mode;

  const toggleMode = (evt) => {
    if (evt === modeId) return;

    const newId = evt ?? null,
      mode = MODES.find(({ id }) => id === newId),
      modeHandler = mode ? new mode.handler() : null;

    setMode({ modeId: newId, modeHandler });
  };

  const editToggle = (mode) => {
    if (mode === DRAW_TYPES.LINE_STRING) {
      toggleMode(
        modeId === DRAW_TYPES.LINE_STRING ? 'editing' : DRAW_TYPES.LINE_STRING
      );
    } else if (mode === DRAW_TYPES.POLYGON) {
      /** clear map before drawig new polygon */
      if (coordinates.length) {
        setAreaIsValid(true);
        setCoordinates([]);
      }
      toggleMode(
        modeId === DRAW_TYPES.POLYGON ? 'editing' : DRAW_TYPES.POLYGON
      );
    }
  };

  const handleClearMap = () => {
    setAreaIsValid(true);
    if (selectedFeatureData?.selectedFeature) {
      clearMap(selectedFeatureData);
    }
  };

  const MapControlButton = ({
    top = '90px',
    style = {},
    onClick,
    children,
  }) => (
    <div style={{ position: 'absolute', top, right: '10px' }}>
      <div className='mapboxgl-ctrl mapboxgl-ctrl-group'>
        <button
          style={{ ...style }}
          onClick={onClick}
          className='mapboxgl-ctrl-icon d-flex justify-content-center align-items-center'
          type='button'
        >
          {children}
        </button>
      </div>
    </div>
  );

  // TODO: is this what's causing need to double click icon?
  const selectedDrawType = isDrawingPolygon
    ? DRAW_TYPES.POLYGON
    : DRAW_TYPES.LINE_STRING;

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

  const handleSelectMapStyle = (mapStyle) => {
    dispatch(setSelectedMapStyle(mapStyle));
  };

  const handleSelect = (selected) => {
    /**
     * onSelect sends the data to the component using the map,
     * setSelectedFeatureData sets the map's internal state for
     * displaying data
     */
    onSelect(selected);
    setSelectedFeatureData(selected);
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
    const stroke =
      FIRE_BREAK_STROKE_COLORS[feature.properties.fireBreakType] ??
      POLYGON_LINE_COLOR;

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
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle={selectedMapStyle.uri}
        ContextProvider={MapContext.Provider}
        onViewStateChange={({ viewState }) => updateViewState(viewState)}
        views={new MapView({ repeat: true })}
        width='100%'
        height='100%'
      >
        <Editor
          clickRadius={12}
          mode={modeHandler}
          features={coordinates}
          onUpdate={handleUpdate}
          onSelect={handleSelect}
          featureStyle={getfeatureStyle}
        />
        <MapStyleSwitcher
          mapStyles={mapStyles}
          selectedMapStyle={selectedMapStyle}
          selectMapStyle={handleSelectMapStyle}
        />

        <FullscreenControl style={getPosition(SCREEN_CONTROL_POSITION)} />

        <NavigationControl
          style={getPosition(NAV_CONTROL_POSITION)}
          showCompass={false}
        />

        <>
          <MapControlButton
            top='50px'
            style={{
              backgroundColor: modeId === selectedDrawType ? 'lightgray' : '',
            }}
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
