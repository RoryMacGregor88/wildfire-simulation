'use client';

import { Provider } from 'react-redux';

import store from '~/store';

import { MapProvider } from '~/hooks';

import App from './app.component';

import '~/assets/scss/theme.scss';

export default function Home() {
  return (
    <Provider store={store}>
      <MapProvider>
        <App />
      </MapProvider>
    </Provider>
  );
}
