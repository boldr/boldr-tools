import path from 'path';
import fs from 'fs-extra';

export function writeFiles(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

export function getComponentPath(componentName, directory, fileName) {
  const cwd = process.cwd();
  const root = path.join(cwd, 'src');
  fs.ensureDirSync(root);

  const dir = path.join(root, directory);
  fs.ensureDirSync(dir);

  const componentPath = path.join(dir, fileName);
  if (fs.existsSync(componentPath)) {
    throw new Error(
      `Component ${componentName} already exists at ${`./${path.relative(process.cwd(), componentPath)}`}`,
    );
  }

  fs.ensureDirSync(componentPath);
  return componentPath;
}
