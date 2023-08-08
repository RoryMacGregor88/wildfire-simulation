import { Card } from 'reactstrap';

import { PolygonMap } from '~/components';

const MapCard = ({
  iconLayer,
  setNewWidth,
  setNewHeight,
  setCoordinates,
  coordinates,
  handleAreaValidation,
  clearMap,
}) => (
  <Card className='map-card mb-0' style={{ height: 730 }}>
    <PolygonMap
      layers={[iconLayer]}
      setWidth={setNewWidth}
      setHeight={setNewHeight}
      screenControlPosition='top-right'
      navControlPosition='bottom-right'
      setCoordinates={setCoordinates}
      coordinates={coordinates}
      key='map'
      handleAreaValidation={handleAreaValidation}
      singlePolygonOnly={true}
      clearMap={clearMap}
    />
  </Card>
);

export default MapCard;
