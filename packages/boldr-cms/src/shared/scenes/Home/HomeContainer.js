import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { getAppData } from '../../state/modules/boldr';
import Home from './Home';

class HomeContainer extends Component {
  static displayName = 'HomeContainer';
  // static fetchData() {
  //   return getAppData();
  // }
  componentDidMount() {
    if (!this.props.boldr.loaded) {
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
  };
};

const mapDispatchToProps = (dispatch) => ({ dispatchLoadData: () => dispatch(getAppData()) });

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);

HomeContainer.propTypes = {
  boldr: PropTypes.object,
  dispatchLoadData: PropTypes.func,
};
