import { useState, useEffect } from 'react';

import { area } from '@turf/turf';
import wkt from 'wkt';
import { FieldArray, Formik } from 'formik';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '~/hooks';
import { Tooltip } from 'react-tooltip';
import {
  Button,
  Input,
  FormGroup,
  Label,
  Row,
  Col,
  Card,
  Form,
  Container,
} from 'reactstrap';
import * as Yup from 'yup';

import {
  setSelectedFireBreak,
  selectedFireBreakSelector,
  errorSelector,
} from '~/store/app.slice';
import {
  getWKTfromFeature,
  getGeneralErrors,
  getError,
  isWKTValid,
  getGeoPolygon,
} from '~/utils/utils';

import { MapInput, MapCard } from '~/components';
import {
  SIMULATION_TIME_LIMIT,
  DEFAULT_FIRE_BREAK_TYPE,
  BOUNDARY_CONDITIONS_TABLE_HEADERS,
  PROBABILITY_INFO,
  PROBABILITY_RANGES,
  FIRE_BREAK_OPTIONS,
  MAX_GEOMETRY_AREA,
} from '~/constants';

/** Below methods are function(){} declarations due to use of 'this' object */

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
    const allTimeOffsets = from[1].value.boundaryConditions.map((datum) =>
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
      const boundaryConditionCount = from[0].value.boundaryConditions.length;
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

const renderDynamicError = (errorMessage: string) => (
  <div className='invalid-feedback d-block w-auto' style={{ height: '1rem' }}>
    {errorMessage ?? ''}
  </div>
);

const TABLE_INITIAL_STATE = [0];

const WildfireSimulation = ({ handleResetAOI, setModalData, onSubmit }) => {
  const dispatch = useAppDispatch();

  const validateArea = (feature) => {
    const areaIsValid = Math.ceil(area(feature)) <= MAX_GEOMETRY_AREA.value;
    return areaIsValid;
  };

  const error = useAppSelector(errorSelector);
  const selectedFireBreak = useAppSelector(selectedFireBreakSelector);

  /** to manage number of dynamic (vertical) table rows in `Boundary Conditions` */
  const [tableEntries, setTableEntries] = useState(TABLE_INITIAL_STATE);

  const [fireBreakSelectedOptions, setFireBreakSelectedOptions] = useState({
    0: DEFAULT_FIRE_BREAK_TYPE,
  });

  /** reset global state when form is closed */
  useEffect(() => {
    const cleanup = () => {
      dispatch(setSelectedFireBreak(null));
    };

    return cleanup;
  }, [dispatch]);

  /**
   * side effect used so that select value can be controlled by both
   * the select itself and the map features when selected
   */
  useEffect(() => {
    if (selectedFireBreak) {
      const { position, type } = selectedFireBreak;
      setFireBreakSelectedOptions((prev) => ({
        ...prev,
        [position]: type,
      }));
    }
  }, [selectedFireBreak]);

  /**
   * This is never called from drawing on map, only if
   * pasted/typed directly into field
   */
  const mapInputOnChange = (value, setFieldValue) => {
    /**
     * WKT converted to GeoJson for storage in form values,
     * is converted back to WKT to be displayed in form field
     */
    setFieldValue('mapSelection', getGeoPolygon(value));

    /**
     * The below section is here because the field value
     * 'isMapAreaValid' is shared by this input and the map
     * itself
     */

    /** User has cleared input, remove area validation error */
    if (!value) {
      setFieldValue('isMapAreaValid', true);
    } else {
      const isWktValid = isWKTValid(value);
      setFieldValue('isValidWkt', isWktValid);

      const features = wkt.parse(value);
      if (features) {
        const isAreaValid = validateArea(features);
        setFieldValue('isMapAreaValid', isAreaValid);
      }
    }
  };

  const clearForm = (resetForm) => {
    setTableEntries(TABLE_INITIAL_STATE);
    resetForm();
  };

  /** used to compute end date from start date and number of hours */
  const getDateOffset = (startTime, numberHours) => {
    if (!startTime || !numberHours) return;

    const endTime = moment(startTime)
      .add(numberHours, 'hours')
      .toISOString()
      .slice(0, 19);

    return endTime;
  };

  const addBoundaryConditionTableColumn = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    const nextIndex = tableEntries.length;
    setTableEntries([...tableEntries, nextIndex]);

    /**
     * registers the new boundary condition row, so that it can
     * be detected by validator functions
     */
    setFieldValue(`boundaryConditions.${nextIndex}.timeOffset`, nextIndex);

    /**
     * add selected fire break key for boundary condition
     * when new boundary condition is created
     */
    setFireBreakSelectedOptions((prev) => ({
      ...prev,
      [nextIndex]: DEFAULT_FIRE_BREAK_TYPE,
    }));
  };

  const removeBoundaryConditionTableColumn = (position) => {
    setTableEntries(tableEntries.filter((entry) => entry !== position));

    /** remove selected fire break key for boundary condition when it is deleted */
    setFireBreakSelectedOptions((prev) =>
      Object.entries(prev).reduce(
        (acc, [k, v]) => (Number(k) === position ? acc : { ...acc, [k]: v }),
        {}
      )
    );
  };

  const handleFireBreakEditClick = (evt, position) => {
    /** disable button's default 'submit' type, prevent form submitting prematurely */
    evt.preventDefault();

    const isSelected = selectedFireBreak?.position === position;
    const type = fireBreakSelectedOptions[position];
    dispatch(setSelectedFireBreak(isSelected ? null : { position, type }));
  };

  const getAllGeojson = (formValues) => {
    const { mapSelection, boundaryConditions } = formValues;

    const fireBreaks = boundaryConditions.reduce((acc, cur) => {
      /** will be sub-array of features if more than one line drawn */
      const features = Object.values(cur.fireBreak ?? {}).flat();
      return [...acc, ...features];
    }, []);

    return [...(mapSelection ?? []), ...fireBreaks];
  };

  return (
    <Container>
      <Row>
        <Col>
          <Row>
            <Formik
              initialValues={{
                simulationTitle: '',
                simulationDescription: '',
                probabilityRange: 0.75,
                mapSelection: [],
                isMapAreaValid: true,
                isValidWkt: true,
                hoursOfProjection: 1,
                ignitionDateTime: '',
                simulationFireSpotting: false,
                boundaryConditions: [
                  {
                    timeOffset: 0,
                    windDirection: '',
                    windSpeed: '',
                    fuelMoistureContent: '',
                    fireBreak: {},
                  },
                ],
              }}
              validationSchema={WildfireSimulationSchema}
              onSubmit={onSubmit}
              id='wildfireSimulationForm'
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                resetForm,
              }) => {
                const maxTables =
                  tableEntries.length === Number(values.hoursOfProjection);
                return (
                  <Form
                    onSubmit={handleSubmit}
                    className='d-flex flex-column justify-content-between'
                  >
                    <Container>
                      <Row>
                        <Col
                          xl={5}
                          className='d-flex flex-column justify-content-between'
                        >
                          {/* do not remove this div, it is required to group these four elements together for styling purposes. */}
                          <div>
                            <Row>
                              <Col className='d-flex align-items-center'>
                                <h4>Request Map</h4>
                              </Col>
                              <Col className='d-flex justify-content-end align-items-center'>
                                <Button
                                  color='link'
                                  onClick={handleResetAOI}
                                  className='p-0'
                                >
                                  Default AOI
                                </Button>
                              </Col>
                            </Row>

                            <Row>{getGeneralErrors(error)}</Row>

                            <Row xl={12}>
                              <h5>Wildfire Simulation</h5>
                            </Row>

                            <Row>
                              <FormGroup className='form-group'>
                                <Label for='dataLayerType'>
                                  Simulation Title
                                </Label>
                                <Input
                                  name='simulationTitle'
                                  className={
                                    !!errors.simulationTitle ? 'is-invalid' : ''
                                  }
                                  id='simulationTitle'
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.simulationTitle}
                                  placeholder='[Type simulation title]'
                                />
                                {!!touched.simulationTitle &&
                                  getError({
                                    key: 'simulationTitle',
                                    errors,
                                    touched,
                                  })}
                              </FormGroup>
                            </Row>

                            <Row>
                              <FormGroup className='form-group'>
                                <Label for='simulationDescription'>
                                  Simulation Description
                                </Label>
                                <Input
                                  id='simulationDescription'
                                  name='simulationDescription'
                                  type='textarea'
                                  rows={3}
                                  className={
                                    !!errors.simulationDescription
                                      ? 'is-invalid'
                                      : ''
                                  }
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.simulationDescription}
                                  placeholder='[Type simulation description]'
                                />
                                {!!touched.simulationDescription &&
                                  getError({
                                    key: 'simulationDescription',
                                    errors,
                                    touched,
                                  })}
                              </FormGroup>
                            </Row>
                          </div>

                          <Row>
                            <FormGroup className='d-flex-column'>
                              <Row>
                                <Label
                                  for='probabilityRange'
                                  className='d-flex align-items-center'
                                >
                                  <Tooltip
                                    id='probabilityTooltip'
                                    place='right'
                                    className='alert-tooltip data-layers-alert-tooltip'
                                  >
                                    {PROBABILITY_INFO}
                                  </Tooltip>
                                  <i
                                    data-tooltip-id='probabilityTooltip'
                                    className='bx bx-info-circle font-size-8 p-0 me-1 cursor-pointer'
                                    style={{ cursor: 'pointer' }}
                                  />
                                  Probability Range
                                </Label>
                              </Row>
                              <Row className='d-flex justify-content-start flex-nowrap gap-2'>
                                {PROBABILITY_RANGES.map(({ label, value }) => (
                                  <Label
                                    key={label}
                                    id={label}
                                    check
                                    className='w-auto'
                                  >
                                    <Input
                                      id={label}
                                      name='probabilityRange'
                                      type='radio'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      checked={
                                        Number(values.probabilityRange) ===
                                        value
                                      }
                                      value={value}
                                      className='me-2'
                                    />
                                    {label}
                                  </Label>
                                ))}
                              </Row>
                            </FormGroup>
                          </Row>

                          <Row>
                            <FormGroup className='form-group'>
                              <Label for='hoursOfProjection'>
                                Hours Of Projection
                              </Label>
                              <Input
                                name='hoursOfProjection'
                                id='hoursOfProjection'
                                className={
                                  !!errors.hoursOfProjection ? 'is-invalid' : ''
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.hoursOfProjection}
                                placeholder='[Type limit (hours)]'
                              />
                              {!!touched.hoursOfProjection &&
                                getError({
                                  key: 'hoursOfProjection',
                                  errors,
                                  touched,
                                })}
                            </FormGroup>
                          </Row>

                          <Row>
                            <FormGroup className='form-group'>
                              <Label for='mapSelection'>Map Selection</Label>
                              <MapInput
                                className={
                                  !!errors.mapSelection ? 'is-invalid' : ''
                                }
                                id='mapSelection'
                                name='mapSelection'
                                type='textarea'
                                rows='5'
                                setCoordinates={(value) =>
                                  mapInputOnChange(value, setFieldValue)
                                }
                                setModalData={setModalData}
                                onBlur={handleBlur}
                                coordinates={getWKTfromFeature(
                                  values.mapSelection
                                )}
                                placeholder='[Paste Well-Known-Text (WKT)]'
                              />
                              {!!touched.mapSelection &&
                                getError({
                                  key: 'mapSelection',
                                  errors,
                                  touched,
                                })}
                              {/* TODO: can just use !, not === false */}
                              {values.isMapAreaValid === false &&
                                getError({
                                  key: 'isMapAreaValid',
                                  errors,
                                  touched,
                                  validateOnChange: true,
                                })}
                              {!!values.mapSelection.length
                                ? getError({
                                    key: 'isValidWkt',
                                    errors,
                                    touched,
                                    validateOnChange: true,
                                  })
                                : null}
                            </FormGroup>
                          </Row>

                          <Row className='mb-3 w-100'>
                            <FormGroup className='form-group'>
                              <Row>
                                <Col>
                                  <Label for='ignitionDateTime'>
                                    Ignition Date Time
                                  </Label>
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  <Input
                                    id='ignitionDateTime'
                                    name='ignitionDateTime'
                                    type='datetime-local'
                                    className={
                                      errors.ignitionDateTime
                                        ? 'is-invalid'
                                        : ''
                                    }
                                    onChange={({ target: { value } }) =>
                                      setFieldValue('ignitionDateTime', value)
                                    }
                                    onBlur={handleBlur}
                                    value={values.ignitionDateTime}
                                  />
                                </Col>
                                <Col>
                                  <Input
                                    type='datetime-local'
                                    disabled
                                    value={getDateOffset(
                                      values.ignitionDateTime,
                                      values.hoursOfProjection
                                    )}
                                  />
                                </Col>
                                {!!touched.ignitionDateTime &&
                                  getError({
                                    key: 'ignitionDateTime',
                                    errors,
                                    touched,
                                  })}
                              </Row>
                            </FormGroup>
                          </Row>

                          <Row
                            xl={5}
                            className='d-flex justify-content-between align-items-center flex-nowrap mb-3 w-100'
                          >
                            <FormGroup className='d-flex flex-nowrap align-items-center w-100'>
                              <Label
                                for='simulationFireSpotting'
                                className='mb-0 me-3'
                              >
                                Simulation Fire Spotting
                              </Label>
                              <Input
                                id='simulationFireSpotting'
                                name='simulationFireSpotting'
                                type='checkbox'
                                onChange={handleChange}
                                value={values.simulationFireSpotting}
                                className='m-0'
                                style={{ cursor: 'pointer' }}
                              />
                              {!!touched.simulationFireSpotting &&
                                getError({
                                  key: 'simulationFireSpotting',
                                  errors,
                                  touched,
                                })}
                            </FormGroup>
                          </Row>
                        </Col>

                        <Col xl={7} className='mx-auto'>
                          <Card
                            className='map-card mb-0 position-relative'
                            style={{ height: 670 }}
                          >
                            <MapCard
                              isDrawingPolygon={!selectedFireBreak}
                              coordinates={getAllGeojson(values)}
                              handleAreaValidation={validateArea}
                              setCoordinates={(geoJson, isAreaValid) => {
                                /** called if map is used to draw polygon */

                                if (selectedFireBreak) {
                                  /** currently selected fireBreak object (data for all fireBreak types) */
                                  const existingFireBreakData =
                                    values.boundaryConditions?.[
                                      selectedFireBreak?.position
                                    ]?.fireBreak;

                                  /** current value of selected BoundaryCondition's select
                                   *  dropdown ('vehicle', 'canadair', etc)
                                   */
                                  const selectedFireBreakType =
                                    fireBreakSelectedOptions[
                                      selectedFireBreak?.position
                                    ];

                                  /** add id specific to A) which boundary condition, B) which fire
                                   * break type, and C) which position within feature array
                                   */
                                  const id = `${selectedFireBreakType}-${
                                    selectedFireBreak?.position
                                  }-${geoJson.length - 1}`;

                                  const newData = [
                                    ...(existingFireBreakData?.[
                                      selectedFireBreakType
                                    ] ?? []),
                                    {
                                      ...geoJson[geoJson.length - 1],
                                      properties: {
                                        id,
                                        fireBreakType: selectedFireBreakType,
                                      },
                                    },
                                  ];

                                  const updatedFireBreakData = {
                                    ...existingFireBreakData,
                                    [selectedFireBreakType]: newData,
                                  };

                                  setFieldValue(
                                    `boundaryConditions.${selectedFireBreak?.position}.fireBreak`,
                                    updatedFireBreakData
                                  );
                                } else {
                                  setFieldValue('mapSelection', geoJson);
                                  setFieldValue('isMapAreaValid', isAreaValid);
                                  setFieldValue('isValidWkt', true);
                                }
                              }}
                              onSelect={(selected) => {
                                const id =
                                  selected?.selectedFeature?.properties?.id;
                                if (id) {
                                  const [type, position] = id.split('-');
                                  dispatch(
                                    setSelectedFireBreak({
                                      type,
                                      position: Number(position),
                                    })
                                  );
                                }
                              }}
                              clearMap={(selectedFeatureData) => {
                                const { properties, geometry } =
                                  selectedFeatureData.selectedFeature;

                                if (geometry.type === 'Polygon') {
                                  setFieldValue('mapSelection', []);
                                  setFieldValue('isMapAreaValid', true);
                                  setFieldValue('isMapAreaValidWKT', true);
                                } else {
                                  /**
                                   * id is specific to individual feature, so can be used for map and
                                   * also setCoords to determnine which to remove from form state
                                   */
                                  const deleteId = properties.id ?? null;

                                  const existingFireBreakData =
                                    values.boundaryConditions?.[
                                      selectedFireBreak?.position
                                    ]?.fireBreak;

                                  /**
                                   * current value of selected BoundaryCondition's select
                                   * ('vehicle', 'canadair', etc)
                                   */
                                  const selectedFireBreakType =
                                    fireBreakSelectedOptions[
                                      selectedFireBreak?.position
                                    ];

                                  /** filter out feature that has been deleted on map */
                                  const filteredData = existingFireBreakData?.[
                                    selectedFireBreakType
                                  ]?.filter(
                                    (feat) => feat.properties.id !== deleteId
                                  );

                                  const updatedFireBreakData = {
                                    ...existingFireBreakData,
                                    [selectedFireBreakType]: filteredData,
                                  };

                                  setFieldValue(
                                    `boundaryConditions.${selectedFireBreak?.position}.fireBreak`,
                                    updatedFireBreakData
                                  );
                                }
                              }}
                            />
                          </Card>
                        </Col>
                      </Row>

                      <Row>
                        <FormGroup className='form-group'>
                          <Label for='boundaryConditions' className='m-0'>
                            Boundary Conditions (paired with 'Hours Of
                            Projection')
                          </Label>
                          <table className='on-demand-table align-content-between'>
                            <thead>
                              <tr
                                className='d-flex justify-content-evenly mt-3'
                                style={{ height: '100%' }}
                              >
                                {BOUNDARY_CONDITIONS_TABLE_HEADERS.map(
                                  (header) => (
                                    <th key={header} className='font-bold'>
                                      {header}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              <FieldArray name='boundaryConditions'>
                                {() =>
                                  tableEntries.map((position) => {
                                    const isFireBreakSelected =
                                      position === selectedFireBreak?.position;
                                    return (
                                      <tr key={position}>
                                        <td>
                                          <i
                                            className='bx bx-trash font-size-24 p-0 w-auto'
                                            onClick={() =>
                                              removeBoundaryConditionTableColumn(
                                                position
                                              )
                                            }
                                            style={{
                                              cursor: 'pointer',
                                              visibility:
                                                position === 0
                                                  ? 'hidden'
                                                  : 'visible',
                                            }}
                                          />
                                        </td>
                                        <td
                                          style={{ justifyContent: 'center' }}
                                        >
                                          <Input
                                            name={`boundaryConditions.${position}.timeOffset`}
                                            id={`boundaryConditions.${position}.timeOffset`}
                                            value={
                                              values.boundaryConditions[
                                                position
                                              ]?.timeOffset
                                            }
                                            disabled={position === 0}
                                            placeholder='[Type value]'
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                          />
                                          {renderDynamicError(
                                            errors.boundaryConditions?.[
                                              position
                                            ]?.timeOffset
                                          )}
                                        </td>
                                        <td>
                                          <Input
                                            name={`boundaryConditions.${position}.windDirection`}
                                            id={`boundaryConditions.${position}.windDirection`}
                                            placeholder='[Type value]'
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                          />
                                          {renderDynamicError(
                                            errors.boundaryConditions?.[
                                              position
                                            ]?.windDirection
                                          )}
                                        </td>
                                        <td>
                                          <Input
                                            name={`boundaryConditions.${position}.windSpeed`}
                                            id={`boundaryConditions.${position}.windSpeed`}
                                            placeholder='[Type value]'
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                          />
                                          {renderDynamicError(
                                            errors.boundaryConditions?.[
                                              position
                                            ]?.windSpeed
                                          )}
                                        </td>
                                        <td>
                                          <Input
                                            name={`boundaryConditions.${position}.fuelMoistureContent`}
                                            id={`boundaryConditions.${position}.fuelMoistureContent`}
                                            placeholder='[Type value]'
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                          />
                                          {renderDynamicError(
                                            errors.boundaryConditions?.[
                                              position
                                            ]?.fuelMoistureContent
                                          )}
                                        </td>
                                        <td>
                                          <div
                                            className='d-flex align-items-center gap-2 my-1'
                                            style={{ width: '100%' }}
                                          >
                                            <Input
                                              type='select'
                                              className='btn-sm sort-select-input'
                                              value={
                                                fireBreakSelectedOptions[
                                                  position
                                                ]
                                              }
                                              onChange={({
                                                target: { value },
                                              }) =>
                                                dispatch(
                                                  setSelectedFireBreak({
                                                    position,
                                                    type: value,
                                                  })
                                                )
                                              }
                                            >
                                              {FIRE_BREAK_OPTIONS.map(
                                                ({ label, value }) => (
                                                  <option
                                                    key={label}
                                                    value={value}
                                                  >
                                                    {label}
                                                  </option>
                                                )
                                              )}
                                            </Input>
                                            <button
                                              key={position}
                                              color='primary'
                                              onClick={(e) =>
                                                handleFireBreakEditClick(
                                                  e,
                                                  position
                                                )
                                              }
                                              className={`btn btn-primary ${
                                                !isFireBreakSelected
                                                  ? 'fire-break-selected'
                                                  : ''
                                              }`}
                                            >
                                              {isFireBreakSelected
                                                ? 'Finish'
                                                : 'Edit'}
                                            </button>
                                          </div>
                                          {/* for consistency in table layout */}
                                          <div style={{ height: '1rem' }} />
                                        </td>
                                        <td>
                                          <Input
                                            name={`boundaryConditions.${position}.fireBreak`}
                                            id={`boundaryConditions.${position}.fireBreak`}
                                            readOnly
                                            type='textarea'
                                            value={getWKTfromFeature(
                                              values.boundaryConditions?.[
                                                position
                                              ]?.fireBreak?.[
                                                fireBreakSelectedOptions[
                                                  position
                                                ]
                                              ] ?? ''
                                            )}
                                            onBlur={handleBlur}
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })
                                }
                              </FieldArray>
                            </tbody>
                            <i
                              onClick={() => {
                                if (maxTables) return;
                                addBoundaryConditionTableColumn(setFieldValue);
                              }}
                              className='bx bx-plus-circle p-0 text-lg'
                              style={{
                                cursor: 'pointer',
                                alignSelf: 'center',
                                fontSize: '2.5rem',
                              }}
                            />
                          </table>
                        </FormGroup>
                      </Row>

                      <Row>
                        <Col>
                          <Button
                            type='submit'
                            className='btn btn-primary'
                            color='primary'
                          >
                            Request
                          </Button>
                          <Button
                            className='btn btn-secondary ms-3'
                            color='secondary'
                            onClick={() => clearForm(resetForm)}
                          >
                            Clear
                          </Button>
                        </Col>
                      </Row>
                    </Container>
                  </Form>
                );
              }}
            </Formik>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default WildfireSimulation;
