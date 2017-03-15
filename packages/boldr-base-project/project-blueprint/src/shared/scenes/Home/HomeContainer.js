import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { getAppData } from '../../state/modules/boldr';
import Home from './Home';

class HomeContainer extends Component {
  static displayName = 'Home';
  // static fetchData() {
  //   return getAppData();
  // }
  static propTypes = {
    posts: PropTypes.object,
    isFetching: PropTypes.boolean,
    loaded: PropTypes.boolean,
    dispatchLoadData: PropTypes.func,
    data: PropTypes.array,
  };
  componentDidMount() {
    if (!this.props.loaded) {
      this.props.dispatchLoadData();
    }
  }

  render() {
    return (
      <Home />

      // <Home data={ this.props.data } loading={ this.props.isFetching } loaded={ this.props.loaded } />
    );
  }
}
const mapStateToProps = (state) => {
  return {
    boldr: state.boldr,
    data: state.boldr.data,
    isFetching: state.boldr.isFetching,
    loaded: state.boldr.loaded,
  };
};

const mapDispatchToProps = (dispatch) => ({ dispatchLoadData: () => dispatch(getAppData()) });

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
