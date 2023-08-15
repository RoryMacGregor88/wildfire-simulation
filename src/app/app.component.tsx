import { useState, useEffect } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody, Container } from 'reactstrap';
import moment from 'moment';
import {
  SimulationReview,
  WildfireSimulationForm,
  WktHelp,
} from '~/components';
import {
  DEFAULT_WILDFIRE_GEOMETRY_BUFFER,
  SIMULATION_REVIEW,
  WILDFIRE_LAYER_TYPES,
  WKT_HELP,
} from '~/constants';
import { useMap, INITIAL_VIEW_STATE } from '~/hooks';
import { getWKTfromFeature } from '~/utils/utils';
import { FormData, Payload } from '~/types';

type ModalData = {
  type: string;
  data?: Payload;
} | null;

const MIN_SCREEN_SIZE = 1500;

const App = () => {
  const { updateViewState } = useMap();
  const [modalData, setModalData] = useState<ModalData>(null);
  const [screenSize, setScreenSize] = useState<number | null>(null);

  useEffect(() => {
    if (!screenSize) {
      const { innerWidth } = window;
      setScreenSize(innerWidth);
    }
  }, [screenSize]);

  const toggle = () => setModalData(null);

  const { type, data } = modalData ?? {};

  const isSimulationReview = type === SIMULATION_REVIEW,
    isWktHelp = type === WKT_HELP;

  const onSubmit = (formData: FormData) => {
    // TODO: test submit works
    /** Rename properties to match what server expects */
    const boundary_conditions = Object.values(formData.boundaryConditions).map(
      ({
        timeOffset,
        windDirection,
        windSpeed,
        fuelMoistureContent,
        fireBreak,
      }) => ({
        time: Number(timeOffset),
        w_dir: Number(windDirection),
        w_speed: Number(windSpeed),
        moisture: Number(fuelMoistureContent),
        fire_break: !fireBreak
          ? {} /** filter out any fireBreak keys which are just empty arrays */
          : Object.entries(fireBreak).reduce(
              (acc, [key, value]) =>
                !!value.length
                  ? {
                      ...acc,
                      [key]: getWKTfromFeature(value),
                    }
                  : acc,
              {}
            ),
      }),
      []
    );

    const transformedGeometry = getWKTfromFeature(formData.mapSelection);

    const startDateTime = new Date(formData.ignitionDateTime),
      endDateTime = new Date(
        moment(startDateTime)
          .add(formData.hoursOfProjection, 'hours')
          .toISOString()
          .slice(0, 19)
      );

    const payload: Payload = {
      data_types: WILDFIRE_LAYER_TYPES.map(({ id }) => id),
      geometry: transformedGeometry,
      geometry_buffer_size: DEFAULT_WILDFIRE_GEOMETRY_BUFFER,
      title: formData.simulationTitle,
      parameters: {
        description: formData.simulationDescription,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        time_limit: Number(formData.hoursOfProjection),
        probability_range: Number(formData.probabilityRange),
        fire_spotting: formData.simulationFireSpotting,
        boundary_conditions,
      },
    };

    setModalData({ type: SIMULATION_REVIEW, data: payload });
  };

  if (!screenSize) return null;

  return screenSize >= MIN_SCREEN_SIZE ? (
    <div className='page-content'>
      <Container className='sign-up-aoi-map-bg'>
        <Row>
          <Col xl={5} className='mb-3'>
            <Row className='d-flex align-items-baseline'>
              <Col xl={4} className='d-flex align-items-baseline'>
                <p className='alert-title'>'Data Layers'</p>
              </Col>
            </Row>
          </Col>
          <Col xl={7} />
        </Row>
        <WildfireSimulationForm
          handleResetAOI={() => updateViewState(INITIAL_VIEW_STATE)}
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
  ) : (
    <div
      className='d-flex flex-column justify-content-center align-items-center gap-4 text-center px-2'
      style={{ height: '100%' }}
    >
      <h1>Unable to load.</h1>
      <h3>
        This app is designed for screen sizes of {MIN_SCREEN_SIZE} pixels width
        or more.
      </h3>
      <h3>Your current device width is {screenSize} pixels.</h3>
    </div>
  );
};

export default App;
