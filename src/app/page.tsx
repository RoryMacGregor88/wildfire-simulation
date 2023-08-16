'use client';

import { Provider } from 'react-redux';

import { MapProvider } from '~/hooks';
import store from '~/store';

import App from './app.component';

// eslint-disable-next-line import/no-unassigned-import
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
