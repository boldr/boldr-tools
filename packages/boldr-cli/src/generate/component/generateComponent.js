import path from 'path';
import fs from 'fs-extra';

import transformCase from '../../util/transformCase';
import getComponentDefaults from './componentDefaults';
import template from './template';
import { writeFiles, getComponentPath } from './helpers';

export default function generateComponent(component, options = {}) {
  options = getComponentDefaults(options);

  const fileName = transformCase(component, options.fileFormat);
  const componentName = transformCase(component, options.componentFormat);
  const componentPath = getComponentPath(
    componentName,
    options.directory,
    fileName,
  );

  const files = template({
    fileName,
    componentName,
    componentPath,
    noTest: !options.test,
    isStateless: options.isStateless,
    semiColon: options.semi ? ';' : '',
    cssExtension: options.cssExtension.replace(/^\./, ''),
  });

  for (const file of files) {
    writeFiles(file.filePath, file.content);
  }

  return {
    componentName,
    componentPath,
    files,
  };
}
