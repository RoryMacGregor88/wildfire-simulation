import React from 'react';

import { Input } from 'reactstrap';

import { WKT_HELP } from '~/constants';

const MapInput = ({ coordinates, setCoordinates, setModalData, ...rest }) => (
  <div className='polygon-edit-input'>
    <Input
      value={coordinates}
      onChange={({ target: { value } }) => setCoordinates(value)}
      {...rest}
    />
    <i onClick={() => setModalData({ type: WKT_HELP, data: null })} />
  </div>
);

export default MapInput;
