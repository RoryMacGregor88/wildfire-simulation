import { PolygonLayer } from '@deck.gl/layers';
import { fitBounds } from '@math.gl/web-mercator';
import { FlyToInterpolator } from 'deck.gl';
import wkt from 'wkt';

const ORANGE = [226, 123, 29];
const GRAY = [128, 128, 128];
const RED = [230, 51, 79];
const DARK_GRAY = [57, 58, 58];

const ALERT_TYPES = {
  red: [
    'Created',
    'Doing Activity',
    'Ongoing',
    'Available',
    'Moving',
    'Taken in Charge',
  ],
  gray: ['Notified', 'Closed', 'Expired', 'Completed', 'Off'],
};

/**
 * For the current viewport and bbox, figour out the new lat/lon/zoom
 * to apply to the map.
 */
const getBoundedViewState = (deckRef, bbox) => {
  const viewport = deckRef.current.deck;
  const { width, height } = viewport;
  // padding reduced. This was set too high, causing a
  // deckGL assertion that image was too small to display
  const padding = 50;

  const [minX, minY, maxX, maxY] = bbox;

  const bounds = [
    [minX, minY],
    [maxX, maxY],
  ];

  return fitBounds({
    bounds,
    width,
    height,
    padding,
  });
};

const getViewState = (
  midPoint,
  zoomLevel = 4,
  selectedAlert,
  setHoverInfoRef = () => {},
  setViewStateChangeRef = () => {}
) => ({
  midPoint: midPoint,
  longitude: selectedAlert
    ? getShiftedLongitude(midPoint[0], zoomLevel)
    : midPoint[0],
  latitude: midPoint[1],
  zoom: zoomLevel,
  pitch: 0,
  bearing: 0,
  transitionDuration: 1000,
  transitionInterpolator: new FlyToInterpolator(),
  onTransitionEnd: () => {
    if (selectedAlert) {
      setHoverInfoRef({
        object: {
          properties: selectedAlert,
          geometry: {
            coordinates:
              selectedAlert?.center || selectedAlert?.geometry?.coordinates,
          },
        },
        picked: true,
      });
      setViewStateChangeRef(false);
    }
  },
});

const getPolygonLayer = (aoi) => {
  const coordinates = aoi.features[0].geometry.coordinates;
  return new PolygonLayer({
    id: 'polygon-layer',
    data: coordinates,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    wireframe: true,
    lineWidthMinPixels: 1,
    opacity: 0.25,
    getPolygon: (d) => d,
    getFillColor: [192, 105, 25],
    getLineColor: [0, 0, 0],
    getLineWidth: 100,
  });
};

const getAlertIconColorFromContext = (mapType, feature, selectedItem = {}) => {
  let color = DARK_GRAY;
  if (!feature.properties.id && !selectedItem.id) {
    return color;
  }

  if (feature.properties.id === selectedItem.id) {
    color = ORANGE;
  } else if (ALERT_TYPES.red.includes(feature?.properties?.status)) {
    color = RED;
  } else if (ALERT_TYPES.gray.includes(feature?.properties?.status)) {
    return GRAY;
  }
  return color;
};

const getAsGeoJSON = (data) =>
  data.map((datum) => {
    const { geometry, ...properties } = datum;
    return {
      type: 'Feature',
      properties,
      geometry,
    };
  });

export const EPSG_4326 = 'EPSG4326';
export const EPSG_3857 = 'EPSG3857';

/* EPSG support ranges - validator obj  */

const VALIDATORS = {
  [EPSG_4326]: {
    longitude: [-180, 180],
    latitude: [-90, 90],
  },
  [EPSG_3857]: {
    longitude: [-180, 180],
    latitude: [-85.06, 85.06],
  },
};

/* Validate WKT and coordinates */
const areCoordsValid = ([long, lat], epsgCode = EPSG_3857) => {
  let isValid = false;
  const currentValidator = VALIDATORS[epsgCode];

  if (
    typeof long === 'number' &&
    long >= currentValidator.longitude[0] &&
    long <= currentValidator.longitude[1]
  ) {
    if (
      typeof lat === 'number' &&
      lat >= currentValidator.latitude[0] &&
      lat <= currentValidator.latitude[1]
    ) {
      isValid = true;
    }
  }

  return isValid;
};

const getWKTfromFeature = (feature) => {
  var tempFeature = null,
    tempWKT = '';
  if (!feature || feature.length === 0) {
    tempWKT = '';
  } else if (feature.length > 1) {
    tempFeature = {
      type: 'GeometryCollection',
      geometries: feature.map((x) => x.geometry),
    };
    tempWKT = wkt.stringify(tempFeature);
  } else {
    tempWKT = wkt.stringify(feature[0].geometry);
  }
  const newWKT = tempWKT.replace(/\d+\.\d+/g, function (match) {
    return Number(match).toFixed(6);
  });
  return newWKT;
};

const isWKTValid = (str) => {
  const geoObj = wkt.parse(str);
  if (geoObj) {
    const geometryArr = geoObj.geometries ? geoObj.geometries : [geoObj]; // Supports for both collections and single geometry
    return geometryArr.every((geometry) =>
      geometry.coordinates[0].every((coord) => areCoordsValid(coord))
    );
  }
  return !!geoObj;
};

const getPolygonLayerFromGeometry = (geometry) => {
  // fetch polygon for arbitrary polygonal geometry
  // e.g. AOI for a data layer
  return new PolygonLayer({
    data: geometry.coordinates,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    wireframe: true,
    lineWidthMinPixels: 1,
    opacity: 0.25,
    getPolygon: (d) => d,
    getFillColor: [192, 105, 25],
    getLineColor: [0, 0, 0],
    getLineWidth: 100,
  });
};

const getGeneralErrors = (errors) => {
  if (!errors) return '';

  return (
    <Card color='danger' className='text-white-50'>
      <CardBody>
        <CardTitle className='mb-4 text-white'>
          <i className='mdi mdi-alert-outline me-3' />
          Please fix the following error(s):
        </CardTitle>
        <List className='text-white'>{getErrorListItems(errors)}</List>
      </CardBody>
    </Card>
  );
};

const getError = (key, errors, touched, errStyle = true, validateOnChange) => {
  if (errors[key] && (touched[key] || validateOnChange)) {
    return errStyle ? (
      'is-invalid'
    ) : (
      <div className='invalid-feedback d-block'>{errors[key]}</div>
    );
  }
};

export {
  getBoundedViewState,
  getViewState,
  getPolygonLayer,
  getAlertIconColorFromContext,
  getAsGeoJSON,
  areCoordsValid,
  getWKTfromFeature,
  isWKTValid,
  getPolygonLayerFromGeometry,
  getGeneralErrors,
  getError,
};
