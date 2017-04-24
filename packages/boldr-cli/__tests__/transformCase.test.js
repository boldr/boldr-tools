import transformCase from '../src/util/transformCase';

describe('transformCase', () => {
  it('should throw on undefined transformation function', () => {
    expect(() => transformCase('', 'foobar')).toThrowErrorMatchingSnapshot();
  });

  it('should use the correct transform function', () => {
    const transFn = [
      'camelCase',
      'constantCase',
      'headerCase',
      'paramCase',
      'pascalCase',
      'snakeCase',
    ];
    for (const transform of transFn) {
      expect(transformCase('test this', transform)).toMatchSnapshot();
    }
  });

  it('should default to pascal case', () => {
    expect(transformCase('test this')).toMatchSnapshot();
  });
});
