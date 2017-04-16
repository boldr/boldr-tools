/* eslint-disable react/no-danger, react/no-array-index-key, react/jsx-key */

import React, {Children} from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';
import {ifElse, removeNil} from 'boldr-utils';
import Html from '../../../shared/components/Html';

const clientAssets = require(ASSETS_MANIFEST);

function KeyedComponent({children}) {
  return Children.only(children);
}

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const devDlls = '/assets/dlls/__boldr_dlls__.js';
function stylesheetTag(stylesheetFilePath) {
  return (
    <link
      href={stylesheetFilePath}
      media="screen, projection"
      rel="stylesheet"
      type="text/css"
    />
  );
}
function scriptTag(jsFilePath) {
  return <script type="text/javascript" src={jsFilePath} />;
}

export default function ServerHtml(props) {
  const {reactAppString, nonce, preloadedState, styles, helmet} = props;

  // Creates an inline script definition that is protected by the nonce.
  const inlineScript = body => (
    <script
      nonce={nonce}
      type="text/javascript"
      dangerouslySetInnerHTML={{__html: body}}
    />
  ); // eslint-disable-line

  const headerElements = removeNil([
    ...ifElse(helmet)(() => helmet.title.toComponent(), []),
    ...ifElse(helmet)(() => helmet.base.toComponent(), []),
    ...ifElse(helmet)(() => helmet.meta.toComponent(), []),
    ...ifElse(helmet)(() => helmet.link.toComponent(), []),
    ifElse(isProd && clientAssets && clientAssets.vendor.css)(() =>
      stylesheetTag(clientAssets.vendor.css),
    ),
    ifElse(isProd && clientAssets && clientAssets.main.css)(() =>
      stylesheetTag(clientAssets.main.css),
    ),
    ...ifElse(helmet)(() => helmet.style.toComponent(), []),
  ]);

  const bodyElements = removeNil([
    // Binds the client configuration object to the window object so
    // that we can safely expose some configuration values to the
    // client bundle that gets executed in the browser.
    inlineScript(
      `window.__PRELOADED_STATE__=${serialize(props.preloadedState)};`,
    ),
    scriptTag(
      'https://cdn.polyfill.io/v2/polyfill.min.js?features=default,Symbol',
    ),
    ifElse(isProd && clientAssets && clientAssets.vendor.js)(() =>
      scriptTag(clientAssets.vendor.js),
    ),
    ifElse(isDev)(() =>
      scriptTag(`/assets/dlls/__boldr_dlls__.js?t=${Date.now()}`),
    ),
    ifElse(clientAssets && clientAssets.main.js)(() =>
      scriptTag(clientAssets.main.js),
    ),
    ...ifElse(helmet)(() => helmet.script.toComponent(), []),
  ]);

  return (
    <Html
      htmlAttributes={ifElse(helmet)(
        () => helmet.htmlAttributes.toComponent(),
        null,
      )}
      headerElements={headerElements.map((x, idx) => (
        <KeyedComponent key={idx}>{x}</KeyedComponent>
      ))}
      bodyElements={bodyElements.map((x, idx) => (
        <KeyedComponent key={idx}>{x}</KeyedComponent>
      ))}
      appBodyString={reactAppString}
    />
  );
}