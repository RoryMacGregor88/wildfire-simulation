const WktHelp = () => (
  <div className='px-3 mb-3'>
    Sample WKT format
    <div className='my-3 fw-bold'>
      POINT (30 10)
      <br />
      LINESTRING (30 10, 10 30, 40 40)
      <br />
      POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))
      <br />
      POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20
      30))
      <br />
      MULTIPOINT ((10 40), (40 30), (20 20), (30 10))
      <br />
      MULTIPOINT (10 40, 40 30, 20 20, 30 10)
      <br />
      MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))
      <br />
      MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10,
      15 5)))
      <br />
      MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5,
      45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))
      <br />
      GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40),
      POLYGON ((40 40, 20 45, 45 30, 40 40)))
    </div>
    For more info, please refer to the following wiki link (
    <a
      href='https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry'
      target='_blank'
      rel='noreferrer'
    >
      https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry
    </a>
    )
  </div>
);

export default WktHelp;
