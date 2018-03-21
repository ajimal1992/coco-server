# Coco Server

## Description
A modified COCO training software using the example provided by https://github.com/tylin/coco-ui. This repo aims to create a server using nodeJS and perform annotations to images from a folder. The COCO annotations will be inserted into a JSON file. 

## Ubuntu 16.04 Installation
1. Install nodejs
    - Windows/Mac - https://nodejs.org/en/download/
    - Linux - https://nodejs.org/en/download/package-manager/
        
               curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
               sudo apt-get install -y nodejs
2. Clone repo

       git clone https://github.com/ajimal1992/coco-server.git
3. Go to repo directory

       cd coco-server
4. Install dependencies

       npm install
5. Start server

       node server.js
6. Browse to - http://localhost:55555/

