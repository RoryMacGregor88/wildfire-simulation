'use client';

import { Provider } from 'react-redux';

import store from '~/store';

import { MapProvider } from '~/hooks';

import { WildfireSimulationForm } from '~/components';

import '~/assets/scss/theme.scss';

export default function Home() {
  const handleResetAOI = () => {};
  const backToOnDemandPanel = () => {};
  const mapInputOnChange = () => {};
  const onSubmit = () => {};

  return (
    <Provider store={store}>
      <MapProvider>
        <WildfireSimulationForm
          handleResetAOI={handleResetAOI}
          backToOnDemandPanel={backToOnDemandPanel}
          mapInputOnChange={mapInputOnChange}
          onSubmit={onSubmit}
        />
      </MapProvider>
    </Provider>
  );
}
