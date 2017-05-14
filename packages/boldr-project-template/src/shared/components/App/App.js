/* @flow */

import React from 'react';
import Helmet from 'react-helmet';
import styles from './App.css';

import '../../styles/main.scss';

export default function App(/* props: Object */) {
  return (
    <div>
      <Helmet title="Hello World" />
      <h1 className={styles.red}>Hello World!</h1>
       <h2 className={styles.red}>Hello World!</h2>
    </div>
  );
}
