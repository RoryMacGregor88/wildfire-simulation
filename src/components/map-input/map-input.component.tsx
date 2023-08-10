import React from 'react';

import { Input } from 'reactstrap';

import { WKT_HELP } from '~/constants';

const MapInput = ({ setCoordinates, coordinates, setModalData, ...rest }) => (
  <div className='polygon-edit-input'>
    <Input
      onChange={({ target: { value } }) => setCoordinates(value)}
      value={coordinates}
      {...rest}
    />
    <i onClick={() => setModalData({ type: WKT_HELP, data: null })} />
  </div>
);

export default MapInput;
