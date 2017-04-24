# Boldr CLI

The CLI for Boldr allows quick scaffolding of a new Boldr project.

## Commands

### Init
`boldr-cli init`  
Creates a new Boldr project.  

##### Options

You will be prompted to choose between:
- `Boldr CMS`: Create a new CMS project.
This code is the frontend React application and serverside rendering only.


- `Boldr API`: Create a new API project.  
The backend for Boldr. It includes the REST api, Postgres, Redis and Docker setups.  


- `Boldr Fullstack`: Initialize the complete Boldr suite.
Generates both the API and the frontend CMS.
-----
### Component
`boldr-cli component <NAME>`

Generate a new component and the related files.
```
index.js
Foo.js
Foo.test.js
Foo.scss
```
_src/shared/components/Foo_

##### Options

`-s, --stateless`
Stateless function component

`-d, --directory`
Specify the directory for the component. The default directory is `./src/shared/components/`

`-c, --css-extension <css|less|sass`  
Use a different style type. The default for Boldr is scss.

`-t, --test <jest|none>` Choose between jest or none. A Jest test file is automatically created by default.
