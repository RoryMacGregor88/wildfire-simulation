import React, { useState } from 'react';

import { Input } from 'reactstrap';

import { isWKTValid } from '~/utils/utils';

import { WKT_HELP } from '~/constants';

const MapInput = ({
  isValidFormat = () => {},
  setCoordinates,
  coordinates,
  setModalData,
  ...rest
}) => {
  const [showError, setShowError] = useState(false);

  const onChange = (value) => {
    const isValid = isWKTValid(value);
    isValid ? setCoordinates(value) : setCoordinates('');
    setShowError(!isValid);
    isValidFormat(isValid);
  };

  return (
    <div className='polygon-edit-input'>
      <Input
        className={rest.className}
        id={rest.id ? rest.id : 'coord-input'}
        name={rest.name ? rest.name : 'coord-input'}
        onBlur={rest.onBlur ?? undefined}
        placeholder={rest.placeholder ?? undefined}
        rows={rest.rows ?? undefined}
        type={rest.type ?? undefined}
        onChange={({ target: { value } }) => onChange(value)}
        value={coordinates}
      />
      <i
        onClick={() => setModalData({ type: WKT_HELP, data: null })}
        className={`fa fa-question-circle fa-2x ${
          showError ? 'text-danger' : ''
        }`}
      ></i>
      {!!showError && <div className='error-message'>{'coordinate-error'}</div>}
    </div>
  );
};

export default MapInput;
