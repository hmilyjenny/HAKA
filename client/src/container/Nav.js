/**
 *
 * Nav.js
 *
 * This component renders the navigation bar
 *
 */

import React, { Component } from 'react';
import { Link } from 'react-router';
import LoadingButton from '../components/base/LoadingButton';
//import { logout } from '../../actions/AppActions';

class Nav extends Component {
  constructor(props, context) {
      super(props, context);
    }
  render() {
    // Render either the Log In and register buttons, or the logout button
    // based on the current authentication state.
    const navButtons = this.props.loggedIn ? (
        <div>
          <Link to="/dashboard" className="btn btn--dash btn--nav">控制面板</Link>
          {this.props.currentlySending ? (
            <LoadingButton className="btn--nav" />
          ) : (
            <a href="#" className="btn btn--login btn--nav" onClick={this._logout}>登出</a>
          )}
        </div>
      ) : (
        <div>
          <Link to="/register" className="btn btn--login btn--nav">注册</Link>
          <Link to="/login" className="btn btn--login btn--nav">登陆</Link>
        </div>
      );

    return(
      <div className="nav">
        <div className="nav__wrapper">
          <Link to="/" className="nav__logo-wrapper"><h1 className="nav__logo">看&nbsp;理想</h1></Link>
          { navButtons }
        </div>
      </div>
    );
  }

  _logout() {
    //this.props.dispatch(logout());
  }
}

Nav.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
  currentlySending: React.PropTypes.bool.isRequired
}

export default Nav;
