# Boldr CLI

The CLI for Boldr allows quick scaffolding of a new Boldr project.


## Commands

### New
`boldr-cli new`  
Creates a new Boldr project.  

**Options**

- `-c (--cms)`: Create a new CMS project.
Get the code for a new BoldrCMS project.


- `-a (--api)`: Create a new API project.  
Get the code for a new BoldrAPI project.  

- `-f (--full)`: Initialize the complete Boldr suite (API/CMS)   
Sets up both the API and the CMS for Boldr.

### Init (Not Ready)
`boldr-cli init`  
Creates a new Boldr project.  

**Options**

- `-d`: Directory to use.   
Default is the current working directory. As of the first release, the directory is somewhat buggy so it's best to use the CWD.  


- `-p`: Package manager you'd like to use.  
Yarn is the default. `boldr-cli init -p npm` uses npm.

- `-r`: Git repository  
Pass this to install the [Boldr-DX](https://github.com/boldr/getBoldr/packages/boldr-dx) build scripts to your own custom project.
