import React, { useEffect, useState } from 'react';

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
import { area } from '@turf/turf';
import { MapStyleSwitcher } from '~/components';
import { useAppDispatch, useAppSelector, useMap } from '~/hooks';

import { FIRE_BREAK_STROKE_COLORS, MAX_GEOMETRY_AREA } from '~/constants';
import {
  selectedMapStyleSelector,
  mapStylesSelector,
  setSelectedMapStyle,
} from '~/store/app.slice';

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
  onSelect = () => {},
  clearMap,
  singlePolygonOnly,
  isDrawingPolygon,
  handleAreaValidation,
  screenControlPosition = 'top-right',
  navControlPosition = 'bottom-right',
}) => {
  const { viewState, setViewState } = useMap();

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
  };

  const [modeId, setModeId] = useState(null);
  const [modeHandler, setModeHandler] = useState(null);
  const [selectedFeatureData, setSelectedFeatureData] = useState(null);
  const [areaIsValid, setAreaIsValid] = useState(true);

  const toggleMode = (evt) => {
    if (evt !== modeId) {
      const tempModeId = evt ? evt : null;
      const mode = MODES.find((m) => m.id === tempModeId);
      const modeHandler = mode ? new mode.handler() : null;
      setModeId(tempModeId);
      setModeHandler(modeHandler);
    }
  };

  const editToggle = (mode) => {
    if (mode === DRAW_TYPES.LINE_STRING) {
      toggleMode(
        modeId === DRAW_TYPES.LINE_STRING ? 'editing' : DRAW_TYPES.LINE_STRING
      );
    } else if (mode === DRAW_TYPES.POLYGON) {
      if (singlePolygonOnly && coordinates.length) {
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

  const Toolbar = () => (
    <>
      <MapControlButton
        top='50px'
        style={
          modeId === selectedDrawType ? { backgroundColor: 'lightgray' } : {}
        }
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
  );

  const handleUpdate = (val) => {
    if (val.editType === 'addFeature') {
      const featureArea = Math.ceil(area(val.data[0])),
        isValid = featureArea <= MAX_GEOMETRY_AREA.value;

      setAreaIsValid(isValid);
      setCoordinates(val.data, isValid);
      toggleMode('editing');
    } else if (val.editType === 'movePosition') {
      setCoordinates(val.data, areaIsValid);
    }
  };

  const handleSelectMapStyle = (mapStyle) => {
    dispatch(setSelectedMapStyle(mapStyle));
  };

  return (
    <>
      <MapGL
        {...viewState}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle={selectedMapStyle.uri}
        ContextProvider={MapContext.Provider}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        views={new MapView({ repeat: true })}
        width='100%'
        height='100%'
      >
        <Editor
          clickRadius={12}
          mode={modeHandler}
          features={coordinates}
          onUpdate={handleUpdate}
          onSelect={(selected) => {
            // TODO: explain this with comment
            onSelect(selected);
            setSelectedFeatureData(selected);
          }}
          featureStyle={({ feature, state, index }) => {
            if (index === 0) {
              setAreaIsValid(handleAreaValidation(feature));
            }
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

            return feature.geometry.type === 'Polygon'
              ? defaultFeatureStyles
              : { ...defaultFeatureStyles, fill: TRANSPARENT_COLOR };
          }}
        />
        <MapStyleSwitcher
          mapStyles={mapStyles}
          selectedMapStyle={selectedMapStyle}
          selectMapStyle={handleSelectMapStyle}
        />
        <FullscreenControl style={getPosition(screenControlPosition)} />
        <NavigationControl
          style={getPosition(navControlPosition)}
          showCompass={false}
        />
        <Toolbar />
      </MapGL>
    </>
  );
};
export default PolygonMap;
