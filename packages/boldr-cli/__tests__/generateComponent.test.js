import path from 'path';
import generateComponent from '../src/generate/component/generateComponent';

jest.mock('fs-extra');

describe('generateComponent', () => {
  it('should generate a component with default config', () => {
    const data = generateComponent('test-component');
    expect(data.componentName).toMatchSnapshot();
    expect(data.files.map(({ content }) => content)).toMatchSnapshot();
  });

  it('should generate stateless components', () => {
    const data = generateComponent('test-component', { stateless: true });
    const file = data.files.find(
      ({ fileName }) => fileName === 'TestComponent.js',
    );
    expect(file.content).toMatchSnapshot();
  });

  it('should add semi colons', () => {
    const data = generateComponent('test-component', { semi: true });
    expect(data.files.map(({ content }) => content)).toMatchSnapshot();
  });

  it('should change css extension', () => {
    const data = generateComponent('t', { cssExtension: 'sass' });
    expect(
      data.files.find(({ fileName }) => fileName === 'T.sass').content,
    ).toMatchSnapshot();
  });

  it('should skip test file', () => {
    const data = generateComponent('t', { test: 'none' });
    expect(data.files.length).toBe(3);
  });

  it('should use customized directory', () => {
    const data = generateComponent('t', { directory: 'foo' });
    expect(data.componentPath).toContain('/src/foo/T');
  });
});
