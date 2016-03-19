import { createStore, applyMiddleware } from 'redux';
//import { persistState } from 'redux-devtools';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';
import DevTools from '../container/DevTools/DevTools';

export default function configureStore() {

  const storeWithMiddleware = applyMiddleware (
  	thunkMiddleware
  )(createStore);
  const store = storeWithMiddleware(rootReducer);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
