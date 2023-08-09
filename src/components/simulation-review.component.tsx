import DOMPurify from 'dompurify';
import highlight from 'json-format-highlight';

const SimulationReview = ({ data }) => {
  const jsonTheme = {
    keyColor: '#fff',
    numberColor: 'blue',
    stringColor: '#0B7500',
    trueColor: '#00cc00',
    falseColor: '#ff8080',
    nullColor: 'cornflowerblue',
  };

  return (
    <div>
      <h4>Below is a summary of your requested wildfire simulation:</h4>
      <pre className='px-3'>
        <code
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(highlight(data, jsonTheme)),
          }}
        />
      </pre>
    </div>
  );
};

export default SimulationReview;

{
  /* <div className='simulation-review-list'>
      <h2>Below is a summary of your requested qildfire simulation:</h2>
      <ul>
        <li>
          <h4>Simulation title: </h4>
          <p>{data.simulationTitle}</p>
        </li>
        <li>
          <h4>Simulation description: </h4>
          <p>{data.simulationDescription}</p>
        </li>
        <li>
          <h4>Probability range: </h4>
          <p>{data.probabilityRange}</p>
        </li>
        <li>
          <h4>Hours of projection: </h4>
          <p>{data.hoursOfProjection}</p>
        </li>
        <li>
          <h4>Map selection: </h4>
          <div className='simulation-review-list'>
            {data.mapSelection.map(({type, geometry, proerties}) => {
              return (
                <ul>
                  <li>
                    <h4>Type:</h4>
                    <p>{type}</p>
                  </li>
                  <li>what to do about properties?</li>
                  <div>
                    <h4>Geometry: </h4>
                    <div>
                      <ul>
                        <li>
                          <h4>Type:</h4>
                          <p>{geometry.type}</p>
                        </li>
                        <li></li>
                      </ul>
                    </div>
                  </div>
                </ul>
              );
            })}
          </div>
        </li>
        // TODO: where is end date?
        <li>
          <h4>Ignition date/time: </h4>
          <p>{data.ignitionDateTime}</p>
        </li>
        <li>
          <h4>Simulation fire spotting: </h4>
          <p>{data.simulationFireSpotting}</p>
        </li>
        <li>
          <h4>Boundary conditions: </h4>
          <p>asdffasd</p>
        </li>
      </ul>
    </div> */
}
