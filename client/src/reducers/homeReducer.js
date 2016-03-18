const assign = Object.assign || require('object.assign');

const initialState = {
  formState: {
    username: '',
    password: ''
  },
  currentlySending: false,
  loggedIn: false
};

export default function homeReducer(state = initialState, action) {
    return state;
}
