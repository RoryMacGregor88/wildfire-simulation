import { useState } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import {
  SimulationReview,
  WildfireSimulationForm,
  WktHelp,
} from '~/components';
import { SIMULATION_REVIEW, WKT_HELP } from '~/constants';
import { useMap } from '~/hooks';

const App = () => {
  const { resetViewState } = useMap();
  const [modalData, setModalData] = useState(null);

  const toggle = () => setModalData(null);

  const { type, data } = modalData ?? {};

  const isSimulationReview = type === SIMULATION_REVIEW,
    isWktHelp = type === WKT_HELP;

  const mapInputOnChange = (values) => {
    console.log('MAP VALUES: ', values);
  };

  const onSubmit = (formValues) => {
    setModalData({ type: SIMULATION_REVIEW, data: formValues });
  };

  return (
    <div className='page-content'>
      <div className='sign-up-aoi-map-bg'>
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
          mapInputOnChange={mapInputOnChange}
          setModalData={setModalData}
          onSubmit={onSubmit}
        />
      </div>
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
