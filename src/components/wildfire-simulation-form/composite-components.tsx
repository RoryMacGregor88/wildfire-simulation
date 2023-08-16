import { Tooltip } from 'react-tooltip';
import { Button, Card, Col, FormGroup, Input, Label, Row } from 'reactstrap';

import { Error, MapInput, PolygonMap } from '~/components';
import {
  BOUNDARY_CONDITIONS_TABLE_HEADERS,
  FIRE_BREAK_OPTIONS,
  PROBABILITY_INFO,
  PROBABILITY_RANGES,
} from '~/constants';
import { INITIAL_VIEW_STATE, useAppDispatch, useMap } from '~/hooks';
import { setSelectedFireBreak } from '~/store/app.slice';
import { FireBreakValue } from '~/types';
import { getWKTfromFeature } from '~/utils/utils';

/** Form section on left */
const TopFormSection = ({
  mapInputOnChange,
  setModalData,
  getDateOffset,
  ...formProps
}) => {
  const { updateViewState } = useMap();
  const { errors, values, touched, setFieldValue, handleChange, handleBlur } =
    formProps;

  const handleDateChange = async ({ target: { value } }) =>
    await setFieldValue('ignitionDateTime', value);

  return (
    <>
      <Row>
        <Col className='d-flex align-items-center'>
          <h4>Request Map</h4>
        </Col>
        <Col className='d-flex justify-content-end align-items-center'>
          <Button
            className='p-0'
            color='link'
            onClick={() => updateViewState(INITIAL_VIEW_STATE)}
          >
            Default AOI
          </Button>
        </Col>
      </Row>

      <Row xl={12}>
        <h5>Wildfire Simulation</h5>
      </Row>

      <Row>
        <FormGroup className='form-group'>
          <Label for='dataLayerType'>Simulation Title</Label>
          <Input
            className={!!errors.simulationTitle ? 'is-invalid' : ''}
            id='simulationTitle'
            name='simulationTitle'
            placeholder='[Type simulation title]'
            value={values.simulationTitle}
            onBlur={handleBlur}
            onChange={handleChange}
          />

          {!!touched.simulationTitle ? (
            <Error message={errors.simulationTitle} />
          ) : null}
        </FormGroup>
      </Row>

      <Row>
        <FormGroup className='form-group'>
          <Label for='simulationDescription'>Simulation Description</Label>
          <Input
            className={!!errors.simulationDescription ? 'is-invalid' : ''}
            id='simulationDescription'
            name='simulationDescription'
            placeholder='[Type simulation description]'
            rows={3}
            type='textarea'
            value={values.simulationDescription}
            onBlur={handleBlur}
            onChange={handleChange}
          />

          {!!touched.simulationDescription ? (
            <Error message={errors.simulationDescription} />
          ) : null}
        </FormGroup>
      </Row>

      <Row>
        <FormGroup className='d-flex-column'>
          <Row>
            <Label className='d-flex align-items-center' for='probabilityRange'>
              <Tooltip
                className='alert-tooltip data-layers-alert-tooltip'
                id='probabilityTooltip'
                place='right'
              >
                {PROBABILITY_INFO}
              </Tooltip>
              <i
                className='bx bx-info-circle font-size-8 p-0 me-1 cursor-pointer'
                data-tooltip-id='probabilityTooltip'
                style={{ cursor: 'pointer' }}
              />
              Probability Range
            </Label>
          </Row>

          <Row className='d-flex justify-content-start flex-nowrap gap-2'>
            {PROBABILITY_RANGES.map(({ label, value }) => (
              <Label key={label} check className='w-auto' id={label}>
                <Input
                  checked={Number(values.probabilityRange) === value}
                  className='me-2'
                  id={label}
                  name='probabilityRange'
                  type='radio'
                  value={value}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                {label}
              </Label>
            ))}
          </Row>
        </FormGroup>
      </Row>

      <Row>
        <FormGroup className='form-group'>
          <Label for='hoursOfProjection'>Hours Of Projection</Label>
          <Input
            className={!!errors.hoursOfProjection ? 'is-invalid' : ''}
            id='hoursOfProjection'
            name='hoursOfProjection'
            placeholder='[Type limit (hours)]'
            value={values.hoursOfProjection}
            onBlur={handleBlur}
            onChange={handleChange}
          />

          {!!touched.hoursOfProjection ? (
            <Error message={errors.hoursOfProjection} />
          ) : null}
        </FormGroup>
      </Row>

      <Row>
        <FormGroup className='form-group'>
          <Label for='mapSelection'>Map Selection</Label>
          <MapInput
            className={!!errors.mapSelection ? 'is-invalid' : ''}
            coordinates={getWKTfromFeature(values.mapSelection)}
            id='mapSelection'
            name='mapSelection'
            placeholder='[Paste Well-Known-Text (WKT)]'
            rows='5'
            setCoordinates={(value) => mapInputOnChange(value, setFieldValue)}
            setModalData={setModalData}
            type='textarea'
            onBlur={handleBlur}
          />
          {!!touched.mapSelection ? (
            <Error message={errors.mapSelection} />
          ) : null}
          {values.isMapAreaValid === false ? (
            <Error message={errors.isMapAreaValid} />
          ) : null}
        </FormGroup>
      </Row>

      <Row className='mb-3 w-100'>
        <FormGroup className='form-group'>
          <Row>
            <Col>
              <Label for='ignitionDateTime'>Ignition Date Time</Label>
            </Col>
          </Row>
          <Row>
            <Col>
              <Input
                className={errors.ignitionDateTime ? 'is-invalid' : ''}
                id='ignitionDateTime'
                name='ignitionDateTime'
                type='datetime-local'
                value={values.ignitionDateTime}
                onBlur={handleBlur}
                onChange={handleDateChange}
              />
            </Col>
            <Col>
              <Input
                disabled
                type='datetime-local'
                value={getDateOffset({
                  startTime: values.ignitionDateTime,
                  offset: values.hoursOfProjection,
                })}
              />
            </Col>
          </Row>

          {!!touched.ignitionDateTime ? (
            <Error message={errors.ignitionDateTime} />
          ) : null}
        </FormGroup>
      </Row>

      <Row
        className='d-flex justify-content-between align-items-center flex-nowrap mb-3 w-100'
        xl={5}
      >
        <FormGroup className='d-flex flex-nowrap align-items-center w-100'>
          <Label className='mb-0 me-3' for='simulationFireSpotting'>
            Simulation Fire Spotting
          </Label>
          <Input
            className='m-0'
            id='simulationFireSpotting'
            name='simulationFireSpotting'
            style={{ cursor: 'pointer' }}
            type='checkbox'
            value={values.simulationFireSpotting}
            onChange={handleChange}
          />

          {!!touched.simulationFireSpotting ? (
            <Error message={errors.simulationFireSpotting} />
          ) : null}
        </FormGroup>
      </Row>
    </>
  );
};

/** Map section on right */
// TODO: think of better name
const FormMap = ({
  selectedFireBreak,
  getAllGeojson,
  validateArea,
  fireBreakSelectedOptions,
  ...formProps
}) => {
  const dispatch = useAppDispatch();

  const { values, setFieldValue } = formProps;
  const baseFireBreakId = `boundaryConditions.${selectedFireBreak?.position}.fireBreak`;

  /** Called if map is used to draw line/polygon */
  const setCoordinates = async (geoJson, areaIsValid) => {
    if (selectedFireBreak) {
      /** Currently selected fireBreak object (data for all fireBreak types) */
      const existingFireBreakData =
        values.boundaryConditions?.[selectedFireBreak.position]?.fireBreak;

      /**
       * Current value of selected BoundaryCondition's select
       * dropdown ('vehicle', 'canadair', etc)
       */
      const selectedFireBreakType =
        fireBreakSelectedOptions[selectedFireBreak.position];

      /**
       * Add id specific to A) which boundary condition, B) which fire
       * break type, and C) which position within feature array
       */
      const id = `${selectedFireBreakType}-${selectedFireBreak.position}-${
        geoJson.length - 1
      }`;

      const newData = [
        ...(existingFireBreakData?.[selectedFireBreakType] ?? []),
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

      await setFieldValue(baseFireBreakId, updatedFireBreakData);
    } else {
      await setFieldValue('mapSelection', geoJson);
      await setFieldValue('isMapAreaValid', areaIsValid);
      await setFieldValue('isValidWkt', true);
    }
  };

  const onSelect = (selectedId: string) => {
    if (selectedId) {
      const [type, position] = selectedId.split('-') as [
        FireBreakValue,
        string,
      ];

      dispatch(
        setSelectedFireBreak({
          type,
          position: Number(position),
        }),
      );
    }
  };

  const clearMap = async (selectedFeatureData) => {
    const { properties, geometry } = selectedFeatureData.selectedFeature;

    if (geometry.type === 'Polygon') {
      await setFieldValue('mapSelection', []);
      await setFieldValue('isMapAreaValid', true);
      await setFieldValue('isMapAreaValidWKT', true);
    } else {
      /**
       * id is specific to individual feature, so can be used for map and
       * also setCoords to determnine which to remove from form state
       */
      const deleteId = properties.id ?? null;
      // TODO: is the null needed?^^^

      const existingFireBreakData =
        values.boundaryConditions?.[selectedFireBreak?.position]?.fireBreak;

      /**
       * current value of selected BoundaryCondition's select
       * ('vehicle', 'canadair', etc)
       */
      const selectedFireBreakType =
        fireBreakSelectedOptions[selectedFireBreak?.position];

      /** filter out feature that has been deleted on map */
      const filteredData = existingFireBreakData?.[
        selectedFireBreakType
      ]?.filter(({ properties }) => properties.id !== deleteId);

      const updatedFireBreakData = {
        ...existingFireBreakData,
        [selectedFireBreakType]: filteredData,
      };

      await setFieldValue(baseFireBreakId, updatedFireBreakData);
    }
  };

  return (
    <Card className='map-card mb-0' style={{ height: 730 }}>
      <PolygonMap
        clearMap={clearMap}
        coordinates={getAllGeojson(values)}
        isDrawingPolygon={!selectedFireBreak}
        setCoordinates={setCoordinates}
        validateArea={validateArea}
        onSelect={onSelect}
      />
    </Card>
  );
};

/** Form section at bottom */
const TableHead = () => (
  <thead>
    <tr
      className='d-flex justify-content-evenly mt-3'
      style={{ height: '100%' }}
    >
      {BOUNDARY_CONDITIONS_TABLE_HEADERS.map((header) => (
        <th key={header} className='font-bold'>
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const AddBoundaryConditionIcon = ({
  values,
  maxTables,
  addBoundaryConditionTableColumn,
  setFieldValue,
}) => (
  <div className='d-flex align-items-center justify-center gap-2'>
    <i
      className='bx bx-plus-circle p-0 text-lg'
      style={{
        cursor: 'pointer',
        fontSize: '2.5rem',
      }}
      onClick={() => {
        if (maxTables) return;
        addBoundaryConditionTableColumn(setFieldValue);
      }}
    />
    <span style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
      Max: {values.hoursOfProjection}
    </span>
  </div>
);

const BoundaryConditionColumn = ({
  position,
  selectedFireBreak,
  removeBoundaryConditionTableColumn,
  fireBreakSelectedOptions,
  handleFireBreakEditClick,
  ...formProps
}) => {
  const dispatch = useAppDispatch();

  const { errors, values, touched, handleChange, handleBlur } = formProps;

  const isFireBreakSelected = position === selectedFireBreak?.position;

  const baseFormId = `boundaryConditions.${position}`,
    baseValues = values.boundaryConditions?.[position] ?? {},
    baseErrors = errors.boundaryConditions?.[position] ?? {},
    baseTouched = touched.boundaryConditions?.[position] ?? {};

  const handleFireBreakChange = ({ target: { value } }) =>
    dispatch(
      setSelectedFireBreak({
        position,
        type: value,
      }),
    );

  return (
    <tr key={position}>
      <td>
        <i
          className='bx bx-trash font-size-24 p-0 w-auto'
          style={{
            cursor: 'pointer',
            visibility: position === 0 ? 'hidden' : 'visible',
          }}
          onClick={() => removeBoundaryConditionTableColumn(position)}
        />
      </td>

      <td>
        <Input
          disabled={position === 0}
          id={`${baseFormId}.timeOffset`}
          name={`${baseFormId}.timeOffset`}
          placeholder='[Type value]'
          value={baseValues.timeOffset}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {!!baseTouched.timeOffset ? (
          <Error message={baseErrors.timeOffset} />
        ) : null}
      </td>

      <td>
        <Input
          id={`${baseFormId}.windDirection`}
          name={`${baseFormId}.windDirection`}
          placeholder='[Type value]'
          value={baseValues.windDirection}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {!!baseTouched.windDirection ? (
          <Error message={baseErrors.windDirection} />
        ) : null}
      </td>

      <td>
        <Input
          id={`${baseFormId}.windSpeed`}
          name={`${baseFormId}.windSpeed`}
          placeholder='[Type value]'
          value={baseValues.windSpeed}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {!!baseTouched.windSpeed ? (
          <Error message={baseErrors.windSpeed} />
        ) : null}
      </td>

      <td>
        <Input
          id={`${baseFormId}.fuelMoistureContent`}
          name={`${baseFormId}.fuelMoistureContent`}
          placeholder='[Type value]'
          value={baseValues.fuelMoistureContent}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {!!baseTouched.fuelMoistureContent ? (
          <Error message={baseErrors.fuelMoistureContent} />
        ) : null}
      </td>

      <td>
        <div
          className='d-flex align-items-center gap-2 my-1'
          style={{ width: '100%' }}
        >
          <Input
            className='btn-sm sort-select-input'
            type='select'
            value={fireBreakSelectedOptions[position]}
            onBlur={handleBlur}
            onChange={handleFireBreakChange}
          >
            {FIRE_BREAK_OPTIONS.map(({ label, value }) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </Input>

          <button
            key={position}
            className={`btn btn-primary ${
              !isFireBreakSelected ? 'fire-break-selected' : ''
            }`}
            color='primary'
            onClick={(evt) => handleFireBreakEditClick(evt, position)}
          >
            {isFireBreakSelected ? 'Finish' : 'Edit'}
          </button>
        </div>
      </td>

      <td>
        <Input
          readOnly
          id={`${baseFormId}.fireBreak`}
          name={`${baseFormId}.fireBreak`}
          type='textarea'
          value={getWKTfromFeature(
            baseValues.fireBreak?.[fireBreakSelectedOptions[position]] ?? '',
          )}
        />
      </td>
    </tr>
  );
};

export {
  TopFormSection,
  FormMap,
  TableHead,
  AddBoundaryConditionIcon,
  BoundaryConditionColumn,
};
