import React from 'react';
import { Route,IndexRoute} from 'react-router';
import App from './container/App';
import AnonymousContainer from './container/AnonymousContainer/AnonymousContainer';
import SignUpPage from './components/SignUp/SignUp';

export default(
  <Router history={browserHistory}>
    <Route component={App}>
      <Route path="/" component={HomePage} />
      <Route onEnter={checkAuth}>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/dashboard" component={Dashboard} />
      </Route>
      <Route path="*" component={NotFound} />
    </Route>
  </Router>
);
