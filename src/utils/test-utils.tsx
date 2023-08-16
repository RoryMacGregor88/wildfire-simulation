import { ReactElement, ReactNode } from 'react';

import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = createMockStore([thunk]);

const render = (ui: ReactElement, { state = {} } = {}) => {
  const store = mockStore(state);
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const utils = rtlRender(ui, { wrapper: Wrapper });
  return { ...utils, store };
};

/**
 * The below errors are caused by multiple exports of RTL properties
 * and render, and are non-consequential
 */

// eslint-disable-next-line import/export
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
// eslint-disable-next-line import/export
export { render };
