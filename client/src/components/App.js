import React, { Component } from 'react';
import { connect } from 'react-redux';

class App extends Component {
  render() {
    return(
      <div className="wrapper">
        <Nav loggedIn={this.props.data.loggedIn} history={this.props.history}
         location={this.props.location} dispatch={this.props.dispatch}
          currentlySending={this.props.data.currentlySending} />
        { this.props.children }
      </div>
    )
  }
}

export default App;

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}
