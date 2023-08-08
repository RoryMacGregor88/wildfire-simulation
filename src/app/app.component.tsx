import { Row, Col } from 'reactstrap';
import { WildfireSimulationForm } from '~/components';

const App = () => {
  const handleResetAOI = () => {};
  const backToOnDemandPanel = () => {};
  const mapInputOnChange = () => {};
  const onSubmit = () => {};

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
          handleResetAOI={handleResetAOI}
          backToOnDemandPanel={backToOnDemandPanel}
          mapInputOnChange={mapInputOnChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};

export default App;
