import { useState, useEffect } from 'react';

import { area } from '@turf/turf';
import wkt from 'wkt';
import { Formik } from 'formik';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '~/hooks';

import { Button, Row, Col, Form, Container } from 'reactstrap';

import {
  setSelectedFireBreak,
  selectedFireBreakSelector,
} from '~/store/app.slice';
import { isWKTValid, getGeoPolygon } from '~/utils/utils';

import WildfireSimulationSchema from './wildfire-simulation-form-schema';

import { DEFAULT_FIRE_BREAK_TYPE, MAX_GEOMETRY_AREA } from '~/constants';
import BoundaryConditions from './boundary-conditions/boundary-conditions.component';
import TopFormSection from './top-form-section';
import FormMap from './form-map.component';

const TABLE_INITIAL_STATE = [0],
  FORM_INITIAL_STATE = {
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
  };

const WildfireSimulation = ({ handleResetAOI, setModalData, onSubmit }) => {
  const dispatch = useAppDispatch();

  const validateArea = (feature) => {
    const areaIsValid = Math.ceil(area(feature)) <= MAX_GEOMETRY_AREA.value;
    return areaIsValid;
  };

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
   * typed/pasted directly into field
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

    const isSelected = selectedFireBreak?.position === position,
      type = fireBreakSelectedOptions[position];

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
    <Row>
      <Formik
        initialValues={FORM_INITIAL_STATE}
        validationSchema={WildfireSimulationSchema}
        validateOnChange
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

          const formProps = {
            errors,
            values,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
          };

          return (
            <Form
              onSubmit={handleSubmit}
              className='d-flex flex-column justify-content-between'
            >
              <Container>
                <Row>
                  {/* Body of form, on left */}
                  <Col
                    xl={5}
                    className='d-flex flex-column justify-content-between'
                  >
                    <TopFormSection
                      handleResetAOI={handleResetAOI}
                      mapInputOnChange={mapInputOnChange}
                      setModalData={setModalData}
                      getDateOffset={getDateOffset}
                      {...formProps}
                    />
                  </Col>

                  {/* Map on right */}
                  <Col xl={7} className='mx-auto'>
                    <FormMap
                      selectedFireBreak={selectedFireBreak}
                      getAllGeojson={getAllGeojson}
                      validateArea={validateArea}
                      fireBreakSelectedOptions={fireBreakSelectedOptions}
                      {...formProps}
                    />
                  </Col>
                </Row>

                {/* Dynamic form rows, at bottom */}
                <Row>
                  <BoundaryConditions
                    selectedFireBreak={selectedFireBreak}
                    fireBreakSelectedOptions={fireBreakSelectedOptions}
                    handleFireBreakEditClick={handleFireBreakEditClick}
                    tableEntries={tableEntries}
                    maxTables={maxTables}
                    removeBoundaryConditionTableColumn={
                      removeBoundaryConditionTableColumn
                    }
                    addBoundaryConditionTableColumn={
                      addBoundaryConditionTableColumn
                    }
                    {...formProps}
                  />
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
  );
};

export default WildfireSimulation;
