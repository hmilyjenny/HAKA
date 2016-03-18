import { combineReducers } from 'redux';
import versionReducer from './version';
import homeReducer from './home';

const rootReducer = combineReducers({
  homeReducer,
  versionReducer
});

export default rootReducer;
