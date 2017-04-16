import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

class Home extends Component {
  static displayName = 'Home';

  render() {
    return (
      <div>
        <Helmet title="Home" />
        <div className="wrapper">

          <h1>Boldr</h1>
          <h3>Dumb home page</h3>
        </div>
      </div>
    );
  }
}

export default Home;
