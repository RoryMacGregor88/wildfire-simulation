import * as Yup from 'yup';

import { SIMULATION_TIME_LIMIT, MAX_GEOMETRY_AREA } from '~/constants';

/** Methods are function(){} declarations due to use of 'this' object */

/**
 * This fires if the user enters the same value twice for the `Time`
 * input in the Boundary Conditions fields
 */
Yup.addMethod(Yup.number, 'uniqueTimeOffset', function (message) {
  return this.test('uniqueTimeOffset', message, (timeOffset, { from }) => {
    /**
     * 'from' is an array of parent objects moving from closest
     * to furthest relatives. [0] is the immediate parent object,
     * while [1] is the higher parent array of all of those objects.
     */
    const allTimeOffsets = from?.[1].value.boundaryConditions.map((datum) =>
      Number(datum.timeOffset)
    );

    const matchCount = allTimeOffsets.filter(
      (datum) => datum === timeOffset
    ).length;

    return matchCount <= 1;
  });
});

/**
 * This fires if the user were to select '3' for 'Hours of Projection', then
 * create 3 Boundary Conditions, but then change the Hours of Projection back
 * to a number less than the number of Boundary Condition fields, such as '2'
 */
Yup.addMethod(Yup.number, 'matchHoursToBoundaryConditions', function (message) {
  return this.test(
    'matchHoursToBoundaryConditions',
    message,
    (hours, { from }) => {
      const boundaryConditionCount = from?.[0].value.boundaryConditions.length;
      return Number(hours) >= boundaryConditionCount;
    }
  );
});

const WildfireSimulationSchema = Yup.object().shape({
  simulationTitle: Yup.string().required('This field cannot be empty'),
  simulationDescription: Yup.string().required('This field cannot be empty'),
  hoursOfProjection: Yup.number()
    .typeError('This field must be an integer')
    .min(
      1,
      `Simulation time limit must be between 1 and ${SIMULATION_TIME_LIMIT} hours`
    )
    .max(
      SIMULATION_TIME_LIMIT,
      `Simulation time limit must be between 1 and ${SIMULATION_TIME_LIMIT} hours`
    )
    .matchHoursToBoundaryConditions(
      'Hours cannot be less than number of Boundary Conditions rows'
    )
    .required('This field cannot be empty'),
  probabilityRange: Yup.string().required('This field cannot be empty'),
  mapSelection: Yup.array()
    .typeError('Should contain a valid Well-Known Text')
    .required('This field cannot be empty'),
  isMapAreaValid: Yup.boolean().oneOf(
    [true],
    `Area must be no greater than ${MAX_GEOMETRY_AREA.value}`
  ),
  isMapAreaValidWKT: Yup.boolean().oneOf(
    [true],
    'Should contain a valid Well-Known Text'
  ),
  ignitionDateTime: Yup.date()
    .typeError('Must be valid date selection')
    .required('This field cannot be empty'),
  boundaryConditions: Yup.array().of(
    Yup.object().shape({
      timeOffset: Yup.number()
        .typeError('This field cannot be empty')
        .min(
          0,
          `Time offset must be between 1 and ${SIMULATION_TIME_LIMIT} hours`
        )
        .max(
          SIMULATION_TIME_LIMIT,
          `Time offset must be between 1 and ${SIMULATION_TIME_LIMIT} hours`
        )
        .uniqueTimeOffset('Time offset values must be unique')
        .required('This field cannot be empty'),
      windDirection: Yup.number()
        .typeError('This field must be an integer')
        .typeError('This field must be an integer')
        .min(0, 'Wind direction must be between 0 and 360 degrees')
        .max(360, 'Wind direction must be between 0 and 360 degrees')
        .required('This field cannot be empty'),
      windSpeed: Yup.number()
        .typeError('This field must be an integer')
        .typeError('This field must be an integer')
        .min(0, 'Wind speed must be between 0 and 300 km/h')
        .max(300, 'Wind speed must be between 0 and 300 km/h')
        .required('This field cannot be empty'),
      fuelMoistureContent: Yup.number()
        .typeError('This field must be an integer')
        .typeError('This field must be an integer')
        .min(0, 'Fuel moisture must be between 0% and 100%')
        .max(100, 'Fuel moisture must be between 0% and 100%')
        .required('This field cannot be empty'),
    })
  ),
});

export default WildfireSimulationSchema;
