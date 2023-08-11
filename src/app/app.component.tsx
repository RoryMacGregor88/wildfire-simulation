import { useState } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody, Container } from 'reactstrap';
import wkt from 'wkt';
import { area } from '@turf/turf';
import {
  SimulationReview,
  WildfireSimulationForm,
  WktHelp,
} from '~/components';
import {
  DEFAULT_WILDFIRE_GEOMETRY_BUFFER,
  MAX_GEOMETRY_AREA,
  SIMULATION_REVIEW,
  WILDFIRE_LAYER_TYPES,
  WKT_HELP,
} from '~/constants';
import { useMap } from '~/hooks';
import { getGeoPolygon, getWKTfromFeature, isWKTValid } from '~/utils/utils';

const App = () => {
  const { resetViewState } = useMap();
  const [modalData, setModalData] = useState(null);

  const toggle = () => setModalData(null);

  const { type, data } = modalData ?? {};

  const isSimulationReview = type === SIMULATION_REVIEW,
    isWktHelp = type === WKT_HELP;

  const onSubmit = (formData) => {
    /** Rename properties to match what server expects */
    const boundary_conditions = Object.values(formData.boundaryConditions).map(
      (obj) => ({
        time: Number(obj.timeOffset),
        w_dir: Number(obj.windDirection),
        w_speed: Number(obj.windSpeed),
        moisture: Number(obj.fuelMoistureContent),
        fireBreak: obj.fireBreak
          ? /** filter out any 'fireBreak' keys which are just empy arrays */
            Object.entries(obj.fireBreak).reduce(
              (acc, [key, value]) =>
                !!value.length
                  ? {
                      ...acc,
                      [key]: getWKTfromFeature(value),
                    }
                  : acc,
              {}
            )
          : {},
      }),
      []
    );

    const transformedGeometry = getWKTfromFeature(formData.mapSelection);
    const startDateTime = new Date(formData.ignitionDateTime).toISOString();
    const endDateTime = new Date(
      moment(startDateTime)
        .add(formData.hoursOfProjection, 'hours')
        .toISOString()
        .slice(0, 19)
    );

    const payload = {
      data_types: WILDFIRE_LAYER_TYPES.map(({ id }) => id),
      geometry: transformedGeometry,
      geometry_buffer_size: DEFAULT_WILDFIRE_GEOMETRY_BUFFER,
      title: formData.simulationTitle,
      parameters: {
        description: formData.simulationDescription,
        start: startDateTime,
        end: endDateTime,
        time_limit: Number(formData.hoursOfProjection),
        probabilityRange: Number(formData.probabilityRange),
        do_spotting: formData.simulationFireSpotting,
        boundary_conditions,
      },
    };

    setModalData({ type: SIMULATION_REVIEW, data: payload });
  };

  return (
    <div className='page-content'>
      <Container className='sign-up-aoi-map-bg'>
        <Row>
          <Col xl={5} className='mb-3'>
            <Row className='d-flex align-items-baseline'>
              <Col xl={4} className='d-flex align-items-baseline'>
                <p className='alert-title'>{'Data Layers'}</p>
              </Col>
            </Row>
          </Col>
          <Col xl={7} />
        </Row>
        <WildfireSimulationForm
          handleResetAOI={resetViewState}
          setModalData={setModalData}
          onSubmit={onSubmit}
        />
      </Container>

      <Modal
        centered
        isOpen={!!modalData}
        toggle={toggle}
        size='lg'
        id='staticBackdrop'
      >
        <ModalHeader style={{ borderColor: 'gray' }} toggle={toggle}>
          {isWktHelp ? 'WKT Guidance' : null}
          {isSimulationReview ? 'Simulation Review' : null}
        </ModalHeader>
        <ModalBody>
          {isWktHelp ? <WktHelp /> : null}
          {isSimulationReview ? <SimulationReview data={data} /> : null}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default App;
