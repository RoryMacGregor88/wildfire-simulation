/** Declarations for JS-only packages with no associated types */

type Feature = import('@nebula.gl/edit-modes').Feature;

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

declare module '@deck.gl/core' {
  const View = import('@deck.gl/core/views/view');
  class MapView extends View {
    constructor(props: unknown);
    get controller(): unknown;
  }
}
