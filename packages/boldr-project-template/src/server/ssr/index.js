/* @flow */
import React from 'react';
import type { $Response, $Request } from 'express';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import createHistory from 'history/createMemoryHistory';
import { StaticRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
