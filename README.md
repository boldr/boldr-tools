<p align="center"><img src="/docs/assets/boldr-text-logo.png" width="200"></p>

# Get Boldr
> Monorepo for tools and utilities associated with [BoldrCMS](https://github.com/strues/boldr). Pre-configured Webpack toolkit for universal applications. [Eslint rules](/packages/eslint-config-boldr) for high quality beautiful code. [Babel preset](/packages/babel-preset-boldr) for all your transpiling needs. Command line interface to generate Boldr.

## Quick Start

1. Install [Node.js](https://nodejs.org/) (v6.0+ required).
2. `npm install -g boldr-cli`
3. `boldr-cli init`
4. `npm run dev`
5. Check out `http://localhost:3000`

**Alternatively**, clone this repo  
`git clone https://github.com/boldr/getBoldr.git`

Grab the Boldr Base Project directory and move it somewhere.

`yarn install`

Now you have a ready to rock, preconfigure, universal rendering React application.

### BoldrDX
Webpack and build toolkit for universal React applications. Use it any any application easily by installing as a dev dependency or even easier by passing BoldrCLI a git repository url.


## Documentation

- [boldr-dx](/docs/dx.md)  
- [boldr-cli](/docs/cli.md)  
- [babel-preset-boldr](/docs/babel.md)  
- [eslint-config-boldr](/docs/eslint.md)  


> This project will adhere to semver upon the 1.0.0 release.


## Boldr-DX

Boldr Developer Experience is a build toolkit. If you happen to find Webpack configuration tedious, BoldrDX is for you. BoldrDX uses Webpack in a tailored environment specifically for Boldr. However, you can use it in any project without any troubles.


### Quick Setup
[README](/packages/boldr-dx/README.md)  

1. `npm init -y`

Add Boldr-DX to your dependencies.  

2. `yarn add --dev boldr-dx`  

Create the **SMALL** configuration files. You won't have to configure too much. Promise. 

3. `mkdir .boldr && touch boldr.js`   


4. `package.json`  
Add the commands to your `package.json`.   
