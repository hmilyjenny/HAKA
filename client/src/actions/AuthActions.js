import * as types from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';

const serverUrl = '';
const eventsUrl = `${serverUrl}/api/0/auth`;

export function logout() {
  return (dispatch) => {
    dispatch(sendingRequest(true));
    auth.logout((success, err) => {
      if (success === true) {
        dispatch(sendingRequest(false));
        dispatch(setAuthState(false));
        browserHistory.replace(null, '/');
      } else {
        requestFailed(err);
      }
    });
  }
}
