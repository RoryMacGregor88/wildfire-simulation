import { Card } from 'reactstrap';

import { PolygonMap } from '~/components';

const MapCard = ({
  setCoordinates,
  coordinates,
  clearMap,
  isDrawingPolygon,
  onSelect,
  handleAreaValidation,
}) => (
  <Card className='map-card mb-0' style={{ height: 730 }}>
    <PolygonMap
      setCoordinates={setCoordinates}
      coordinates={coordinates}
      clearMap={clearMap}
      isDrawingPolygon={isDrawingPolygon}
      onSelect={onSelect}
      singlePolygonOnly={true}
      handleAreaValidation={handleAreaValidation}
    />
  </Card>
);

export default MapCard;
