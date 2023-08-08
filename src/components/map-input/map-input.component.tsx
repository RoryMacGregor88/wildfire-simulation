import React, { useState } from 'react';

import { Input, Modal, ModalHeader, ModalBody } from 'reactstrap';

import { isWKTValid } from '~/utils/utils';

const MapInput = ({
  isValidFormat = () => {},
  setCoordinates,
  coordinates,
  ...rest
}) => {
  const [showError, setShowError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const onChange = (val) => {
    const isValid = isWKTValid(val);
    isValid ? setCoordinates(val) : setCoordinates('');
    setShowError(!isValid);
    isValidFormat(isValid);
  };

  return (
    <>
      <div className='polygon-edit-input'>
        <Input
          className={rest.className}
          id={rest.id ? rest.id : 'coord-input'}
          name={rest.name ? rest.name : 'coord-input'}
          onBlur={rest.onBlur ? rest.onBlur : undefined}
          placeholder={rest.placeholder ? rest.placeholder : undefined}
          rows={rest.rows ? rest.rows : undefined}
          type={rest.type ? rest.type : undefined}
          onChange={(e) => onChange(e.target.value)}
          value={coordinates}
        />
        <i
          onClick={() => setIsOpen(true)}
          className={`fa fa-question-circle fa-2x ${
            showError ? 'text-danger' : ''
          }`}
        ></i>
        {showError && <div className='error-message'>{'coordinate-error'}</div>}
      </div>
      <Modal
        centered
        isOpen={isOpen}
        toggle={toggle}
        size='lg'
        id='staticBackdrop'
      >
        <ModalHeader style={{ borderColor: 'gray' }} toggle={toggle}>
          {'wkt-info-topic'}
        </ModalHeader>
        <ModalBody>
          <div className='px-3 mb-3'>
            {'wkt-info-desc1'}
            <div className='my-3 fw-bold'>
              POINT (30 10)
              <br />
              LINESTRING (30 10, 10 30, 40 40)
              <br />
              POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))
              <br />
              POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30
              20, 20 30))
              <br />
              MULTIPOINT ((10 40), (40 30), (20 20), (30 10))
              <br />
              MULTIPOINT (10 40, 40 30, 20 20, 30 10)
              <br />
              MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30
              10))
              <br />
              MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10
              20, 5 10, 15 5)))
              <br />
              MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10
              10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))
              <br />
              GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10
              40), POLYGON ((40 40, 20 45, 45 30, 40 40)))
            </div>
            {'wkt-info-desc2'} (
            <a
              href='https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry'
              target='_blank'
              rel='noreferrer'
            >
              https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry
            </a>
            )
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default MapInput;
