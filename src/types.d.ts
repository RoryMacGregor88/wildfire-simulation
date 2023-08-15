export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface MapContextValue {
  viewState: ViewState;
  updateViewState: (viewStateData: ViewState) => void;
}

type BoundaryConditionsFormData = {
  timeOffset: number;
  windDirection: string;
  windSpeed: string;
  fuelMoistureContent: string;
  fireBreak: FireBreak[];
};

export interface FormData {
  simulationTitle: string;
  simulationTitle: string;
  simulationDescription: string;
  probabilityRange: 0.75;
  mapSelection: WellKnownText[];
  isMapAreaValid: boolean;
  isValidWkt: boolean;
  hoursOfProjection: number;
  ignitionDateTime: string;
  simulationFireSpotting: boolean;
  boundaryConditions: BoundaryConditionsFormData;
}

type FireBreakType = 'Canadair' | 'Helicopter' | 'Water Line' | 'Vehicle';

type WellKnownText = string;

type FireBreakPayload = {
  [key: FireBreakType]: WellKnownText;
};

type BoundaryConditionsPayload = {
  time: number;
  w_dir: string;
  w_speed: string;
  moisture: string;
  fire_break: FireBreakPayload[];
};

export interface Payload {
  data_types: string[];
  geometry: string[];
  geometry_buffer_size: number;
  title: string;
  parameters: {
    description: string;
    start: string;
    end: string;
    time_limit: number;
    probability_range: number;
    fire_spotting: boolean;
    boundary_conditions: BoundaryConditionsPayload;
  };
}
