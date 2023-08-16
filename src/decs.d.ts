/** Declarations for JS-only packages with no associated types */

type Feature = import('@types/geojson').Feature;

declare module 'wkt' {
  function parse(wktString: string): Feature;
  function stringify(feature: Feature): string;
}

type FeatureCollection = {
  type: 'FeatureColection';
  features: Feature[];
};

declare module '@turf/turf' {
  function area(feature: Feature): number;
}
