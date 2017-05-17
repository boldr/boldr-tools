/* @flow */
import React from 'react';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Helmet from 'react-helmet';
import Error404 from './Error404';
import Header from './Header';
import style from './App.css';
import HomeRoute from './HomeRoute';

import './main.scss';

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <Helmet>
        <html lang="en" />
        <title>Boldr</title>
        <meta name="application-name" content="meta" />
        <meta name="description" content="desc" />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="msapplication-TileColor" content="#2b2b2b" />
        <meta name="theme-color" content="#2b2b2b" />
        <link rel="manifest" href="/manifest.json" />

        {/*
          NOTE: This is simply for quick and easy styling on the demo. Remove
          this and the related items from the Content Security Policy in the
          global config if you have no intention of using milligram.
        */}
        <link
          rel="stylesheet"
          href="//fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic"
        />
        <link
          rel="stylesheet"
          href="//cdn.rawgit.com/milligram/milligram/master/dist/milligram.min.css"
        />
      </Helmet>
      <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Switch>
          <Route exact path="/" component={HomeRoute} />
          <Route component={Error404} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
