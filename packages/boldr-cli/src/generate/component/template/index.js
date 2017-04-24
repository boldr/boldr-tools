import path from 'path';
import os from 'os';

const eol = os.EOL;

const componentTemplate = (componentPath, defs) =>
  Object.keys(defs).filter(fileName => defs[fileName]).map(fileName => ({
    fileName,
    filePath: path.join(componentPath, fileName),
    content: (defs[fileName] = ` ${defs[fileName]}`.trim() + eol),
  }));

export default ({
  componentPath,
  componentName,
  fileName,
  semiColon,
  cssExtension,
  noTest,
  isStateless,
}) =>
  componentTemplate(componentPath, {
    [`${fileName}.${cssExtension}`]: `
.${componentName} {}
  `,

    'index.js': `
export { default } from './${fileName}'${semiColon}
  `,

    [`${fileName}.test.js`]: noTest
      ? ''
      : `
import React from 'react'${semiColon}
import ReactDOM from 'react-dom'${semiColon}
import ${componentName} from './${fileName}'${semiColon}

it('renders without crashing', () => {
  const div = document.createElement('div')${semiColon}
  ReactDOM.render(<${componentName} />, div)${semiColon}
})${semiColon}
  `,

    [`${fileName}.js`]: isStateless
      ? `
/* @flow */
import React from 'react'${semiColon}
import './${fileName}.${cssExtension}'${semiColon}

type Props = {

};
const ${componentName} = (props: Props) => (
  <div className="${componentName}"></div>
)${semiColon}

export default ${componentName}${semiColon}

  `
      : `
/* @flow */
import React, { Component } from 'react'${semiColon}
import './${fileName}.${cssExtension}'${semiColon}

type Props = {

};
class ${componentName} extends Component {
  state = {}${semiColon}
  props: Props;
  render() {
    return (
      <div className="${componentName}"></div>
    )${semiColon}
  }
}

export default ${componentName}${semiColon}
  `,
  });
