import { FC, useEffect, useState } from 'react';

import { area } from '@turf/turf';
import { Formik } from 'formik';
import moment from 'moment';
import { Button, Col, Container, Form, Row } from 'reactstrap';
import wkt from 'wkt';

import { BoundaryConditions, FormMap, TopFormSection } from '~/components';
import { DEFAULT_FIRE_BREAK_TYPE, MAX_GEOMETRY_AREA } from '~/constants';
import { useAppDispatch, useAppSelector } from '~/hooks';
import {
  selectedFireBreakSelector,
  setSelectedFireBreak,
} from '~/store/app.slice';
import {
  FireBreakValue,
  FormData,
  ResetForm,
  SetFieldValue,
  SetModalData,
} from '~/types';
import { getGeoPolygon, isWKTValid } from '~/utils/utils';

import WildfireSimulationSchema from './wildfire-simulation-form-schema';

const TABLE_INITIAL_STATE = [0],
  FORM_INITIAL_STATE: FormData = {
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

interface Props {
  setModalData: SetModalData;
  onSubmit: (formData: FormData) => void;
}

const WildfireSimulation: FC<Props> = ({
  setModalData,
  onSubmit,
}): JSX.Element => {
  const dispatch = useAppDispatch();

  const validateArea = (polygon: Feature): boolean =>
    Math.ceil(area(polygon)) <= MAX_GEOMETRY_AREA.value;

  const selectedFireBreak = useAppSelector(selectedFireBreakSelector);

  /** To manage number of dynamic (vertical) table rows in `Boundary Conditions` */
  const [tableEntries, setTableEntries] = useState(TABLE_INITIAL_STATE);

  const [fireBreakSelectedOptions, setFireBreakSelectedOptions] = useState<{
    [key: number]: FireBreakValue;
  }>({
    0: DEFAULT_FIRE_BREAK_TYPE,
  });

  /** Reset global state when form is closed */
  useEffect(() => {
    const cleanup = () => {
      dispatch(setSelectedFireBreak(null));
    };

    return cleanup;
  }, [dispatch]);

  /**
   * Side effect used so that select value can be controlled by both
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
   * typed/pasted directly into field.
   * Value may not be WKT
   */
  const mapInputOnChange = async (
    value: string,
    setFieldValue: SetFieldValue,
  ): Promise<void> => {
    /**
     * WKT converted to GeoJson for storage in form values,
     * is converted back to WKT to be displayed in form field
     */
    await setFieldValue('mapSelection', getGeoPolygon(value));

    /**
     * The below section is here because the field value
     * 'isMapAreaValid' is shared by this input and the map
     * itself
     */

    /** User has cleared input, remove area validation error */
    if (!value) {
      await setFieldValue('isMapAreaValid', true);
    } else {
      const isWktValid = isWKTValid(value);
      await setFieldValue('isValidWkt', isWktValid);

      const polygon = wkt.parse(value);
      if (polygon) {
        const isAreaValid = validateArea(polygon);
        await setFieldValue('isMapAreaValid', isAreaValid);
      }
    }
  };

  const clearForm = (resetForm: ResetForm) => {
    setTableEntries(TABLE_INITIAL_STATE);
    resetForm();
  };

  interface GetDateOffsetArgs {
    startTime: Date;
    offset: number;
  }

  /** Used to compute end date from start date and number of hours */
  const getDateOffset = ({ startTime, offset }: GetDateOffsetArgs) => {
    if (!startTime || !offset) return;

    const endTime = moment(startTime)
      .add(offset, 'hours')
      .toISOString()
      .slice(0, 19);

    return endTime;
  };

  const addBoundaryConditionTableColumn = async (
    setFieldValue: SetFieldValue,
  ) => {
    const nextIndex = tableEntries.length;
    setTableEntries([...tableEntries, nextIndex]);

    /**
     * Register new boundary condition row, so that it can
     * be detected by validator functions
     */
    await setFieldValue(
      `boundaryConditions.${nextIndex}.timeOffset`,
      nextIndex,
    );

    /**
     * Add selected fire break key for boundary condition
     * when new boundary condition is created
     */
    setFireBreakSelectedOptions((prev) => ({
      ...prev,
      [nextIndex]: DEFAULT_FIRE_BREAK_TYPE,
    }));
  };

  const removeBoundaryConditionTableColumn = async (position: number) => {
    setTableEntries(tableEntries.filter((entry) => entry !== position));

    /** Remove selected fire break key for boundary condition when it is deleted */
    setFireBreakSelectedOptions((prev) =>
      Object.entries(prev).reduce(
        (acc, [key, value]) =>
          Number(key) === position ? acc : { ...acc, [key]: value },
        {},
      ),
    );
  };

  const handleFireBreakEditClick = (evt: Event, position: number) => {
    /** Disable button's default 'submit' type, prevent form submitting prematurely */
    evt.preventDefault();

    const isSelected = selectedFireBreak?.position === position,
      type = fireBreakSelectedOptions[position];

    dispatch(setSelectedFireBreak(isSelected ? null : { position, type }));
  };
  // TODO: need to remember what this is for
  const getAllGeojson = (values) => {
    const { mapSelection, boundaryConditions } = values;

    const fireBreaks = boundaryConditions.reduce((acc, cur) => {
      /** Will be sub-array of features if more than one line drawn */
      const features = Object.values(cur.fireBreak ?? {}).flat();
      return [...acc, ...features];
    }, []);

    return [...(mapSelection ?? []), ...fireBreaks];
  };

  return (
    <Row>
      <Formik
        validateOnChange
        id='wildfireSimulationForm'
        initialValues={FORM_INITIAL_STATE}
        validationSchema={WildfireSimulationSchema}
        onSubmit={onSubmit}
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
              className='d-flex flex-column justify-content-between'
              onSubmit={handleSubmit}
            >
              <Container>
                <Row>
                  {/* Body of form, on left */}
                  <Col
                    className='d-flex flex-column justify-content-between'
                    xl={5}
                  >
                    <TopFormSection
                      getDateOffset={getDateOffset}
                      mapInputOnChange={mapInputOnChange}
                      setModalData={setModalData}
                      {...formProps}
                    />
                  </Col>

                  {/* Map on right */}
                  <Col className='mx-auto' xl={7}>
                    <FormMap
                      fireBreakSelectedOptions={fireBreakSelectedOptions}
                      getAllGeojson={getAllGeojson}
                      selectedFireBreak={selectedFireBreak}
                      validateArea={validateArea}
                      {...formProps}
                    />
                  </Col>
                </Row>

                {/* Dynamic form rows, at bottom */}
                <Row>
                  <BoundaryConditions
                    addBoundaryConditionTableColumn={
                      addBoundaryConditionTableColumn
                    }
                    fireBreakSelectedOptions={fireBreakSelectedOptions}
                    handleFireBreakEditClick={handleFireBreakEditClick}
                    maxTables={maxTables}
                    removeBoundaryConditionTableColumn={
                      removeBoundaryConditionTableColumn
                    }
                    selectedFireBreak={selectedFireBreak}
                    tableEntries={tableEntries}
                    {...formProps}
                  />
                </Row>

                <Row>
                  <Col>
                    <Button
                      className='btn btn-primary'
                      color='primary'
                      type='submit'
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
