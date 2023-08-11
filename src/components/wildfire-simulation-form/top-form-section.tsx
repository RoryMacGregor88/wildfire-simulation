import { Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import { Tooltip } from 'react-tooltip';
import { PROBABILITY_INFO, PROBABILITY_RANGES } from '~/constants';
import { Error, getWKTfromFeature } from '~/utils/utils';
import { MapInput } from '~/components';

const TopFormSection = ({
  handleResetAOI,
  mapInputOnChange,
  setModalData,
  getDateOffset,
  ...formProps
}) => {
  const { errors, values, touched, setFieldValue, handleChange, handleBlur } =
    formProps;
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

          {!values.isMapAreaValid ? (
            <Error message={errors.isMapAreaValid} />
          ) : null}

          {!!values.mapSelection.length ? (
            <Error message={errors.mapSelection} />
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

export default TopFormSection;
