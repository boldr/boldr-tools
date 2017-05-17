# Boldr-DX

Boldr Developer Experience is a build toolkit. If you happen to find Webpack configuration tedious, BoldrDX is for you. BoldrDX uses Webpack in a tailored environment specifically for Boldr. However, you can use it in any project without any troubles.


### Quick Setup

Everything is already setup for you if you created a Boldr project with the CLI. Want all the power without BoldrCMS?

Don't fret it's easy. The steps below will also work in an existing project after a few additional tweaks.

1. `npm init -y`

Add Boldr-DX to your dependencies.  

2. `yarn add --dev boldr-dx`  

Create the **SMALL** configuration files. You won't have to configure too much. Promise. Here are the configs the Boldr base project uses [boldr.js](https://github.com/boldr/boldr-tools/blob/master/packages/boldr-project-template/.boldr/boldr.js).

Add vendor libraries to the vendorFiles section of the config. These are included in the dev process as DLLs and are bundled separately in production. Only include client side dependencies, not node only, like Express.

3. `mkdir .boldr && touch boldr.js`   

Insert the config from above into the boldr.js file. The configuration is meant for an entire Boldr project, however you're more than able to use boldr-dx as your go-to webpack runner. Simply remove everything below the bundle key and go about your business.

**OR** use the provided `boldr-project-template` which is a standalone universal React application.

Start the development process.
4. `yarn run dev`

### Features


### Commands

`boldr-dx dev`: Fire up the development process. Compile client and server bundles. Runs the main Express server on port 3000 and the development server on port 3001 for hot reloading.  

Runtime env options
  - `process.env.BOLDR__SERVER_PORT`
  - `process.env.BOLDR__DEV_PORT`
