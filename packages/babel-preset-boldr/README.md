# babel-preset-boldr

Babel preset for [Boldr](https://github.com/strues/boldr)

Env settings: 
```
{
  modules: false,
  debug: false,
  useBuiltIns: true,
  targets: {
    browsers: ['>1%', 'last 2 versions', 'safari >= 9'],
  },
  // if node
  targets: {
    node: 7.7
  },
},
```

**Included Presets:**

- babel-preset-env  
- babel-preset-react  

**Included Plugins:**  

- babel-plugin-syntax-dynamic-import  
- babel-plugin-syntax-flow  
- babel-plugin-transform-class-properties  
- babel-plugin-transform-decorators-legacy  
- babel-plugin-transform-runtime
- babel-plugin-transform-regenerator  
- babel-plugin-transform-export-extensions  
- babel-plugin-transform-object-rest-spread  
- babel-plugin-transform-react-jsx  
- babel-plugin-transform-flow-strip-types
- babel-plugin-dynamic-import-node  
- babel-plugin-dynamic-import-webpack  
   
**Production - React:**  

- babel-plugin-transform-react-constant-elements  
- babel-plugin-transform-react-inline-elements  
- babel-plugin-transform-react-strip-prop-types

**Development - React:**  

- babel-plugin-transform-react-jsx-self  
- babel-plugin-transform-react-jsx-source  



