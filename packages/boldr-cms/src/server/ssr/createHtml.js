/* @flow */

import Helmet from 'react-helmet';
import { renderToString } from 'react-dom/server';

import { ifElse } from 'boldr-utils';
import styleSheet from 'styled-components/lib/models/StyleSheet';

export default function createHtml(WrappedApp: ?Object, preloadedState: ?Object, nonce: string): string {
  // Location of the assets.json file
  // <rootDir>/public/assets/assets.json
  const clientAssets = require(ASSETS_MANIFEST); // eslint-disable-line
  const styledComp = styleSheet.rules().map(rule => rule.cssText).join('\n');

  // Create script tags to embed in the html
  const createVendorScripts = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const prodFiles = !isProduction ? null : clientAssets.vendor.js;
    const devDlls = '/assets/dlls/__boldr_dlls__.js';
    const vendorScripts = isProduction
    // $FlowFixMe
     ? `<script type="text/javascript" charset="utf-8" src="${prodFiles}"></script>`
     : `<script type="text/javascript" charset="utf-8" src="${devDlls}?t=${Date.now()}"></script>`;

    return vendorScripts;
  };

  // Create the application script to embed.
  const createAppScript = () => {
    return `<script type="text/javascript" charset="utf-8" src='${clientAssets.main.js}'></script>`;
  };
  const reactRenderString = WrappedApp
    ? renderToString(WrappedApp)
    : null;

  const helmet = WrappedApp
    ? Helmet.rewind()
    : null;

  return `<!DOCTYPE html>
    <html ${helmet ? helmet.htmlAttributes.toString() : ''}>
      <head>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta httpEquiv='Content-Language' content='en' />
        <link rel='shortcut icon' type='image/x-icon' href='/public/favicon.ico' />
        ${helmet ? helmet.title.toString() : ''}
        ${helmet ? helmet.meta.toString() : ''}
        ${helmet ? helmet.link.toString() : ''}
        <style type="text/css">${styledComp}</style>
        ${helmet ? helmet.style.toString() : ''}
      </head>
      <body>
        <div id='app'>${reactRenderString || ''}</div>
        <script type='text/javascript' nonce=${nonce}>${
          preloadedState
            ? `window.__PRELOADED_STATE__=${JSON.stringify(preloadedState)};`
            : ''
        }</script>
        ${createVendorScripts()}
        ${createAppScript()}
        ${helmet ? helmet.script.toString() : ''}
      </body>
    </html>`;
}
