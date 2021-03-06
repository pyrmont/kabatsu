# Kabatsu README

Kabatsu is a tool for retrieving content from online publications for personal use.

Kabatsu is run as a Node.js script that retrieves content linked from a publication's table of contents. Files are saved to an ```output``` directory for later perusal.

## Requirements

Kabatsu requires [Node.js](http://nodejs.org/) to be installed on your system.

## Installation

```bash
git clone git://github.com/pyrmont/kabatsu.git  # Warning: read-only.
cd kabatsu
npm install
```

Once you have installed Kabatsu, you will need to do the following:

1. create a ```publications``` directory;
2. create a ```.js``` file for each publication you wish to retrieve inside the ```publications``` directory;
3. setup the necessary variables in this file;
3. override any functions from the ```Publication``` and ```Article``` classes as required;
4. move ```examples/publications.js``` to ```publications/publications.js``` and point it at the .js files for the publications you wish to retrieve.

## Examples

The ```examples/first_publication.js``` and ```examples/second_publication.js``` show two examples of how publication files can be written. In the case of ```first_publication.js```, the file initialises the necessary variables and overrides a number of methods in the ```Publication``` and ```Article``` classes. The ```second_publication.js``` simply sets up the variables and otherwise depends on the default methods for retrieval of content. 

## Licence

Original work is placed in the public domain and all rights are disclaimed.