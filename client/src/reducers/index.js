import {combineReducers} from 'redux';
import versionReducer from './versionReducer';
import homeReducer from './homeReducer';

const rootReducer = combineReducers({
    homeReducer,
    versionReducer
});

export default rootReducer;
