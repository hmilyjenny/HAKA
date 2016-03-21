import React from 'react';
import { Route,IndexRoute} from 'react-router';
import App from './container/App';
import HomePage from './container/HomePage/HomePage';
import auth from './utils/auth';

function requireAuth(nextState, replace) {
    let { loggedIn } = store.getState();

  // check if the path isn't dashboard
  // that way we can apply specific logic
  // to display/render the path we want to
  if (nextState.location.pathname !== '/dashboard') {
    if (loggedIn) {
      if (nextState.location.state && nextState.location.pathname) {
        replaceState(null, nextState.location.pathname);
      } else {
        replaceState(null, '/');
      }
    }
  } else {
    // If the user is already logged in, forward them to the homepage
    if (!loggedIn) {
      if (nextState.location.state && nextState.location.pathname) {
        replaceState(null, nextState.location.pathname);
      } else {
        replaceState(null, '/');
      }
    }
  }
}
export default(
  <Route path="/" component={App}>
    <IndexRoute  component={HomePage} />
    <Route onEnter={requireAuth} >
    </Route>
  </Route>
);
