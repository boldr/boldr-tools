# Boldr-DX

Boldr Developer Experience is a build toolkit. If you happen to find Webpack configuration tedious, BoldrDX is for you. BoldrDX uses Webpack in a tailored environment specifically for Boldr. However, you can use it in any project without any troubles.


### Quick Setup

Everything is already setup for you if you created a Boldr project with the CLI. Want all the power without BoldrCMS?

Don't fret it's easy. The steps below will also work in an existing project after a few additional tweaks.

1. `npm init -y`

Add Boldr-DX to your dependencies.  

2. `yarn add --dev boldr-dx`  

Create the **SMALL** configuration files. You won't have to configure too much. Promise. Here are the configs the Boldr base project uses [boldr.config.js](https://github.com/boldr/boldr-tools/blob/master/packages/boldr-base-project/.boldr/boldr.config.js). 

Add vendor libraries to the vendorFiles section of the config. These are included in the dev process as DLLs and are bundled separately in production. Only include client side dependencies, not node only, like Express.

3. `mkdir .boldr && touch boldr.config.js` 

Start the development process.
4. `yarn run dev`

### Features

- A pleasant 😍 developer experience with 🔥 fast bundling, so you can get shit done. This toolbelt takes advantage of tools like, [HappyPack](https://github.com/amireh/happypack) and the DLL capabilities within Webpack itself. Your rebuilds happen fast because, nobody enjoys waiting around like a  🐢  while assets recompile.
- [React-Hot-Loader](https://github.com/gaearon/react-hot-loader): Build your React components with less full page reloads thanks to hot module replacement and React Hot Loader.

- React Router v4


### Commands

`boldr-dx dev`: Fire up the development process. Compile client and server bundles. Runs the main Express server on port 3000 and the development server on port 3001 for hot reloading.  

Runtime env options
  - `process.env.SERVER_PORT`
  - `process.env.SERVER_HOST`
  - `process.env.HMR_PORT`
