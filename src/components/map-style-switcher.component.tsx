import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from 'reactstrap';

const MapStyleSwitcher = ({ mapStyles = {}, selectMapStyle }) => (
  <>
    <UncontrolledTooltip placement='left' target='UncontrolledDropdown'>
      Change Map Style
    </UncontrolledTooltip>

    <UncontrolledDropdown
      id='UncontrolledDropdown'
      className='map-style-dropdown'
      direction='start'
    >
      <DropdownToggle caret size='sm' color='mapstyle'>
        <span className='d-flex align-items-center'>
          <i className='bx bxs-layer map-style-icon'></i>
        </span>
      </DropdownToggle>
      <DropdownMenu>
        {mapStyles.map((mapStyle) => (
          <div
            className='d-flex flex-column align-items-center justify-content-center'
            key={mapStyle.label}
          >
            <DropdownItem onClick={() => selectMapStyle(mapStyle)}>
              <div className='d-flex flex-column align-items-center justify-content-center'>
                <img
                  src={mapStyle.thumbnail}
                  className='w-75 h-75'
                  alt={mapStyle.label}
                />
                <p>{mapStyle.label}</p>
              </div>
            </DropdownItem>
          </div>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  </>
);

export default MapStyleSwitcher;
