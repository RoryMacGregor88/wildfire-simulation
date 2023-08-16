import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';

const MapStyleSwitcher = ({ mapStyles = {}, selectMapStyle }) => (
  <>
    <UncontrolledTooltip placement='left' target='UncontrolledDropdown'>
      Change Map Style
    </UncontrolledTooltip>

    <UncontrolledDropdown
      className='map-style-dropdown'
      direction='start'
      id='UncontrolledDropdown'
    >
      <DropdownToggle caret color='mapstyle' size='sm'>
        <span className='d-flex align-items-center'>
          <i className='bx bxs-layer map-style-icon'></i>
        </span>
      </DropdownToggle>
      <DropdownMenu>
        {mapStyles.map((mapStyle) => (
          <div
            key={mapStyle.label}
            className='d-flex flex-column align-items-center justify-content-center'
          >
            <DropdownItem onClick={() => selectMapStyle(mapStyle)}>
              <div className='d-flex flex-column align-items-center justify-content-center'>
                <img
                  alt={mapStyle.label}
                  className='w-75 h-75'
                  src={mapStyle.thumbnail}
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
