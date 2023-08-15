import {
  DrawPolygonMode,
  DrawLineStringMode,
  EditingMode,
} from 'react-map-gl-draw';

export const SCREEN_CONTROL_POSITION = 'top-right';
export const NAV_CONTROL_POSITION = 'bottom-right';

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export const POLYGON_LINE_COLOR = 'rgb(26,115,232)';
export const POLYGON_FILL_COLOR = 'rgba(255, 255, 255, 0.5)';
export const POLYGON_LINE_DASH = '10,2';
export const POLYGON_ERROR_COLOR = 'rgba(255, 0, 0, 0.5)';
export const TRANSPARENT_COLOR = 'rgba(0, 0, 0, 0)';

export const POINT_RADIUS = 8;

export const MODES = [
  { id: 'editing', text: 'Edit Feature', handler: EditingMode },
  { id: 'drawPolygon', text: 'Draw Polygon', handler: DrawPolygonMode },
  {
    id: 'drawLineString',
    text: 'Draw Line String',
    handler: DrawLineStringMode,
  },
];

export const DRAW_TYPES = {
  LINE_STRING: 'drawLineString',
  POLYGON: 'drawPolygon',
  EDITING: 'editing',
};
