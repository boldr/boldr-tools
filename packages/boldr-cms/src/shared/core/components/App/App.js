import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { injectGlobal, ThemeProvider } from 'styled-components';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../../../components/NotFound';
import RouterWrapper from '../RouterWrapper';
import routes from '../../../scenes/index';
import styles from './styles.scss';

injectGlobal`
  body {
    margin: 0;
  }
`;
class App extends Component {
  static displayName = 'AppComponent';
  render() {
    return (
      <div>
        <RouterWrapper>
          <Switch>
            {
              routes.map(route => {
                return <Route key={ route.path } { ...route } />;
              })
            }
            <Route component={ NotFound } />
          </Switch>
        </RouterWrapper>
      </div>
    );
  }
}

export default App;
