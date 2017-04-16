import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Home from './Home';

class HomeContainer extends Component {
  static displayName = 'HomeContainer';

  render() {
    return <Home />;
  }
}

export default HomeContainer;