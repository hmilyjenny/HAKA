import React from 'react';
import { Route,IndexRoute} from 'react-router';
import App from './container/App';
import HomePage from './container/HomePage/HomePage';

export default(
  <Route path="/" component={App}>
    <Route path="/" component={HomePage} />
  </Route>
);
