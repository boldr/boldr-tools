/* @flow */
/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { setPath, replacePath, RECOVER_PATH } from '../../../state/modules/router';
// import type { ReactChildren } from '../../../../../flow/definitions/react';

type Props = {
  location: Object,
  defaultProps: Object,
  path: string,
  replace: boolean,
  setPath: () => void,
  recoverPath: string,
};

class RouterWrapper extends React.Component {
  componentDidMount() {
    if (this.context.router.history.location.pathname === this.props.recoverPath) {
      this.context.router.history.replace(this.props.path);
    } else {
      this.props.setPath(this.props.location.pathname);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path === nextProps.location.pathname) {
      return;
    }

    // Sync from Redux
    if (nextProps.path !== this.props.path) {
      if (nextProps.replace === true) {
        this.context.router.history.replace(nextProps.path);
      } else {
        this.context.router.history.push(nextProps.path);
      }
    }

    // Sync to Redux
    if (nextProps.location !== this.props.location) {
      this.props.setPath(nextProps.location.pathname);
    }
  }
  props: Props;
  render() {
    return <div>{ this.props.children }</div>;
  }
}

// $FlowFixMe
RouterWrapper.defaultProps = { recoverPath: RECOVER_PATH };
RouterWrapper.contextTypes = { router: React.PropTypes.object };
function mapStateToProps(state) {
  return {
    path: state.router.path,
    replace: state.router.replace,
  };
}

function mapDispatchToProps(dispatch) {
  return { setPath: (path) => dispatch(setPath(path)) };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RouterWrapper));
