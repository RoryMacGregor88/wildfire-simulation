import { combineReducers } from 'redux';

import app from '~/store/app.slice';

export const createRootReducer = () => combineReducers({ app });
