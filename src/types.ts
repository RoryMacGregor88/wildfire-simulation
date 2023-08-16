import { Dispatch, SetStateAction } from 'react';

import { FormikErrors, FormikState } from 'formik';

export interface RootState {
  app: AppState;
}

export interface AppState {
  selectedFireBreak: FireBreakData | null;
  mapStyles: MapStyle[];
  selectedMapStyle: MapStyle;
  error: boolean;
}

export interface MapStyle {
  label: string;
  thumbnail: string;
  uri: string;
}

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

export interface ModalData {
  type: string;
  data?: Payload;
}

export type SetModalData = Dispatch<SetStateAction<ModalData | null>>;

export type FireBreakValue =
  | 'canadair'
  | 'celicopter'
  | 'waterLine'
  | 'vehicle';

type FireBreakLabel = 'Canadair' | 'Helicopter' | 'Water Line' | 'Vehicle';

export interface FireBreakData {
  position: number;
  type: FireBreakValue;
}

export type WellKnownText = string;

type FireBreakFormData = {
  [key in FireBreakLabel]?: WellKnownText;
};

interface BoundaryConditionsFormData {
  timeOffset: number;
  windDirection: string;
  windSpeed: string;
  fuelMoistureContent: string;
  fireBreak: FireBreakFormData;
}

export interface FormData {
  simulationTitle: string;
  simulationDescription: string;
  probabilityRange: 0.75;
  mapSelection: WellKnownText[];
  isMapAreaValid: boolean;
  isValidWkt: boolean;
  hoursOfProjection: number;
  ignitionDateTime: string;
  simulationFireSpotting: boolean;
  boundaryConditions: BoundaryConditionsFormData[];
}

type FireBreakPayload = {
  [key in FireBreakLabel]?: WellKnownText;
};

type BoundaryConditionsPayload = {
  time: number;
  w_dir: number;
  w_speed: number;
  moisture: number;
  fire_break: FireBreakPayload;
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
    boundary_conditions: BoundaryConditionsPayload[];
  };
}

export type SetFieldValue = (
  field: string,
  value: unknown,
  shouldValidate?: boolean | undefined,
) => Promise<void | FormikErrors<unknown>>;

export type ResetForm = (
  nextState?: Partial<FormikState<FormData>> | undefined,
) => void;
