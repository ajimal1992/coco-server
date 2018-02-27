# Coco Server [STILL UNDER PROGRESS]
## File Structure
    |-config
        |-config.js
    |-site
        |-vendor
        |-coco-app.html
        |-error_404.html
        |-error_failure.html
    |-package.json
    |-server.js

## Description
A modified COCO training software using the example provided by https://github.com/tylin/coco-ui. This repo aims to create a server using nodeJS and perform annotations to images from a folder. The COCO annotations will be inserted into a JSON file. 

#### Site Folder
Contains the web application's source codes. Consists of js, css and views folder
#### Config Folder
Contains all the configuration variables (filenames, etc.) for your web application
#### Vendor Folder
Contains the coco web app modified from https://github.com/tylin/coco-ui
#### package.json
Node module dependencies
#### server.js
NodeJS server

## Installation
1. Install nodejs
    - Windows/Mac - https://nodejs.org/en/download/
    - Linux - https://www.ostechnix.com/install-node-js-linux/
2. Clone repo

       git clone https://github.com/ajimal1992/minimal-nodejs-mvc.git
3. Go to repo directory

       cd minimal-nodejs-mvc
4. Install dependencies

       npm install
5. Start server

       node server.js
6. Browse to - http://localhost:55555/

