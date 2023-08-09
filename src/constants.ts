export const WKT_HELP = 'wktHelp';
export const SIMULATION_REVIEW = 'simulationReview';

// 40,000 km2 = 40 million m2
export const MAX_GEOMETRY_AREA = {
  label: '40,000 square kilometres',
  value: 40000000000,
};

// increase the bbox used to view Wildfire layers by 20 kms
export const DEFAULT_WILDFIRE_GEOMETRY_BUFFER = 5;

export const SIMULATION_TIME_LIMIT = 72;

export const DEFAULT_FIRE_BREAK_TYPE = 'canadair';

export const BOUNDARY_CONDITIONS_TABLE_HEADERS = [
  'Time (hours)',
  'Wind Direction',
  'Wind Speed',
  'Fuel Moisture Content',
  'Fire Break Type',
  'Fire Break Data',
];

export const PROBABILITY_INFO =
  'PROPAGATOR output for each time step is a probability (from 0 to 1) field that expresses for each pixel the probability of the fire to reach that specific point in the given time step. In order to derive a contour, we can select to show the contour related to the 0.5, 0.75 and 0.9 of the probability.  For example, the 50% - 0.5 probability contour encapsulates all the pixels who have more than 50% of probability to be reached by fire at the given simulation time.';

export const PROBABILITY_RANGES = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '90%', value: 0.9 },
];

export const FIRE_BREAK_OPTIONS = [
  { label: 'Canadair', value: 'canadair' },
  { label: 'Helicopter', value: 'helicopter' },
  { label: 'Water Line', value: 'waterLine' },
  { label: 'Vehicle', value: 'vehicle' },
];

export const FIRE_BREAK_STROKE_COLORS = {
  canadair: 'rgb(255, 0, 0)',
  helicopter: 'rgb(0,255,0)',
  waterLine: 'rgb(255, 255, 0)',
  vehicle: 'rgb(0, 0, 255)',
};

export const BOUNDARY_CONDITION_INITIAL_STATE = {
  windDirection: '',
  windSpeed: '',
  fuelMoistureContent: '',
  fireBreak: {},
};
