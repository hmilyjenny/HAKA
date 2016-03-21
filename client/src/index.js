import React from 'react';
import {render} from 'react-dom';
import { Provider } from 'react-redux';
import { Router,browserHistory } from 'react-router';
import routes from './routes';
import configureStore from './stores/configureStore';
import DevTools from './container/DevTools/DevTools';

const store = configureStore();

render(
  <Provider store={store}>
    <div>
      <Router history={browserHistory} routes={routes} />
      <DevTools/>
    </div>
  </Provider>, document.getElementById('app')
);
