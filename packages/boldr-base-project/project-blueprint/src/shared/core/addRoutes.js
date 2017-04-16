import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import uuid from 'uuid';

const renderRoute = (store, route, props) => {
  return <route.component { ...props } route={ route } />;
};

renderRoute.propTypes = {
  staticContext: PropTypes.object,
};

renderRoute.defaultProps = {
  staticContext: null,
};

const RouteManager = (props, context) => (
  <Switch>
    {props.routes.map(route => (
      <Route
        key={ Math.random() }
        path={ route.path }
        render={ props => renderRoute(context.store, route, props) }
        exact={ route.exact }
        strict={ route.strict }
      />
    ))}
  </Switch>
);

RouteManager.propTypes = {
  routes: PropTypes.array.isRequired,
};

RouteManager.contextTypes = {
  store: PropTypes.object,
};

export default routes => {
  if (!routes) {
    return null;
  }

  return <RouteManager routes={ routes } />;
};