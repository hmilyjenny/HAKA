//const assign = Object.assign || require('object.assign');
import auth from '../utils/auth';

const initialState = {
  formState: {
    username: '',
    password: ''
  },
  currentlySending: false,
  loggedIn: auth.loggedIn
};

export default function homeReducer(state = initialState, action) {
    return state;
}
