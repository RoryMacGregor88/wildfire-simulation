import { Button, Card, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { Tooltip } from 'react-tooltip';
import { setSelectedFireBreak } from '~/store/app.slice';
import { getWKTfromFeature } from '~/utils/utils';
import { useAppDispatch } from '~/hooks';
import { Error, MapInput, PolygonMap } from '~/components';
import {
  BOUNDARY_CONDITIONS_TABLE_HEADERS,
  FIRE_BREAK_OPTIONS,
  PROBABILITY_INFO,
  PROBABILITY_RANGES,
} from '~/constants';

/** Form section on left */
const TopFormSection = ({
  handleResetAOI,
  mapInputOnChange,
  setModalData,
  getDateOffset,
  ...formProps
}) => {
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
          <Button color='link' onClick={handleResetAOI} className='p-0'>
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
            name='simulationTitle'
            className={!!errors.simulationTitle ? 'is-invalid' : ''}
            id='simulationTitle'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.simulationTitle}
            placeholder='[Type simulation title]'
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
            id='simulationDescription'
            name='simulationDescription'
            type='textarea'
            rows={3}
            className={!!errors.simulationDescription ? 'is-invalid' : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.simulationDescription}
            placeholder='[Type simulation description]'
          />

          {!!touched.simulationDescription ? (
            <Error message={errors.simulationDescription} />
          ) : null}
        </FormGroup>
      </Row>

      <Row>
        <FormGroup className='d-flex-column'>
          <Row>
            <Label for='probabilityRange' className='d-flex align-items-center'>
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
              <Label key={label} id={label} check className='w-auto'>
                <Input
                  id={label}
                  name='probabilityRange'
                  type='radio'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  checked={Number(values.probabilityRange) === value}
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
          <Label for='hoursOfProjection'>Hours Of Projection</Label>
          <Input
            name='hoursOfProjection'
            id='hoursOfProjection'
            className={!!errors.hoursOfProjection ? 'is-invalid' : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.hoursOfProjection}
            placeholder='[Type limit (hours)]'
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
            id='mapSelection'
            name='mapSelection'
            type='textarea'
            rows='5'
            setCoordinates={(value) => mapInputOnChange(value, setFieldValue)}
            setModalData={setModalData}
            onBlur={handleBlur}
            coordinates={getWKTfromFeature(values.mapSelection)}
            placeholder='[Paste Well-Known-Text (WKT)]'
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
                id='ignitionDateTime'
                name='ignitionDateTime'
                type='datetime-local'
                className={errors.ignitionDateTime ? 'is-invalid' : ''}
                onChange={handleDateChange}
                onBlur={handleBlur}
                value={values.ignitionDateTime}
              />
            </Col>
            <Col>
              <Input
                type='datetime-local'
                disabled
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
        xl={5}
        className='d-flex justify-content-between align-items-center flex-nowrap mb-3 w-100'
      >
        <FormGroup className='d-flex flex-nowrap align-items-center w-100'>
          <Label for='simulationFireSpotting' className='mb-0 me-3'>
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

  const onSelect = (selected) => {
    const id = selected?.selectedFeature?.properties?.id;
    if (id) {
      const [type, position] = id.split('-');
      dispatch(
        setSelectedFireBreak({
          type,
          position: Number(position),
        })
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
        isDrawingPolygon={!selectedFireBreak}
        coordinates={getAllGeojson(values)}
        validateArea={validateArea}
        setCoordinates={setCoordinates}
        onSelect={onSelect}
        clearMap={clearMap}
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
      onClick={() => {
        if (maxTables) return;
        addBoundaryConditionTableColumn(setFieldValue);
      }}
      className='bx bx-plus-circle p-0 text-lg'
      style={{
        cursor: 'pointer',
        fontSize: '2.5rem',
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
      })
    );

  return (
    <tr key={position}>
      <td>
        <i
          className='bx bx-trash font-size-24 p-0 w-auto'
          onClick={() => removeBoundaryConditionTableColumn(position)}
          style={{
            cursor: 'pointer',
            visibility: position === 0 ? 'hidden' : 'visible',
          }}
        />
      </td>

      <td>
        <Input
          name={`${baseFormId}.timeOffset`}
          id={`${baseFormId}.timeOffset`}
          value={baseValues.timeOffset}
          disabled={position === 0}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {!!baseTouched.timeOffset ? (
          <Error message={baseErrors.timeOffset} />
        ) : null}
      </td>

      <td>
        <Input
          name={`${baseFormId}.windDirection`}
          id={`${baseFormId}.windDirection`}
          value={baseValues.windDirection}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {!!baseTouched.windDirection ? (
          <Error message={baseErrors.windDirection} />
        ) : null}
      </td>

      <td>
        <Input
          name={`${baseFormId}.windSpeed`}
          id={`${baseFormId}.windSpeed`}
          value={baseValues.windSpeed}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {!!baseTouched.windSpeed ? (
          <Error message={baseErrors.windSpeed} />
        ) : null}
      </td>

      <td>
        <Input
          name={`${baseFormId}.fuelMoistureContent`}
          id={`${baseFormId}.fuelMoistureContent`}
          value={baseValues.fuelMoistureContent}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
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
            type='select'
            className='btn-sm sort-select-input'
            value={fireBreakSelectedOptions[position]}
            onChange={handleFireBreakChange}
            onBlur={handleBlur}
          >
            {FIRE_BREAK_OPTIONS.map(({ label, value }) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </Input>

          <button
            key={position}
            color='primary'
            onClick={(evt) => handleFireBreakEditClick(evt, position)}
            className={`btn btn-primary ${
              !isFireBreakSelected ? 'fire-break-selected' : ''
            }`}
          >
            {isFireBreakSelected ? 'Finish' : 'Edit'}
          </button>
        </div>
      </td>

      <td>
        <Input
          name={`${baseFormId}.fireBreak`}
          id={`${baseFormId}.fireBreak`}
          readOnly
          type='textarea'
          value={getWKTfromFeature(
            baseValues.fireBreak?.[fireBreakSelectedOptions[position]] ?? ''
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
