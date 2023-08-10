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

/**
 * EPSG:3857 is a Web Mercator projection used for display by many web-based
 * mapping tools, including Google Maps and OpenStreetMap, see link:
 * https://en.wikipedia.org/wiki/EPSG_Geodetic_Parameter_Dataset
 */
const EPSG_3857 = {
  longitude: [-180, 180],
  latitude: [-85.06, 85.06],
};

/* Validate WKT and coordinates */
const areCoordsValid = (coords: [number, number]) => {
  if (coords.some((coord) => typeof coord !== 'number')) return false;

  const [long, lat] = coords,
    { longitude, latitude } = EPSG_3857;

  const longIsValid = long >= longitude[0] && long <= longitude[1],
    latIsValid = lat >= latitude[0] && lat <= latitude[1];

  return longIsValid && latIsValid ? true : false;
};

const getWKTfromFeature = (value) => {
  /**
   * user has typed non-WKT into field, which was
   * not converted into valid GeoJson
   */
  if (!Array.isArray(value)) return value;

  const features = value;
  if (features?.length) {
    const dataShape =
      features.length > 1
        ? {
            type: 'GeometryCollection',
            geometries: features.map((x) => x.geometry),
          }
        : features[0].geometry;

    const wktStr = wkt.stringify(dataShape);
    return wktStr.replace(/\d+\.\d+/g, (match) => Number(match).toFixed(6));
  }
};

const isWKTValid = (wktString: string): boolean => {
  const geoObj = wkt.parse(wktString);

  if (!geoObj) return false;

  /** Support for both collections and single geometry */
  const geometryArray = geoObj.geometries ? geoObj.geometries : [geoObj];

  return geometryArray.every((geometry) =>
    geometry.coordinates[0].every((coord) => areCoordsValid(coord))
  );
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

const getGeoPolygon = (value) => {
  const geoJson = wkt.parse(value);

  /**
   * if non-valid field (user has typed/pasted non-WKT),
   * just return the value and let validation catch error
   */
  if (!geoJson) return value;

  const feature = {
    type: 'Feature',
    properties: {},
    geometry: geoJson,
  };

  return [feature];
};

// TODO: move this, no JSX in utils
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

interface GetErrorArgs {
  key: string;
  errors: { [key: string]: string };
  touched: { [key: string]: string };
  errorStyle?: boolean;
  validateOnChange?: boolean;
}

// TODO: same here, move
const getError = ({
  key,
  errors,
  touched,
  validateOnChange = true,
}: GetErrorArgs) => {
  if (errors[key]) {
    return <div className='invalid-feedback d-block'>{errors[key]}</div>;
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
  getGeoPolygon,
  getGeneralErrors,
  getError,
};
