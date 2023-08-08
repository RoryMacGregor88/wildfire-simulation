import { configureStore } from '@reduxjs/toolkit';

import { createRootReducer } from '~/root.reducer';

const store = configureStore({
  reducer: createRootReducer(),
});

/** Infer the 'RootState' and 'AppDispatch' types from the store itself */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
