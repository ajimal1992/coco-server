# Coco Server

## Description
A modified COCO training software using the example provided by https://github.com/tylin/coco-ui. This repo aims to create a server using nodeJS and perform annotations to images from a folder. The COCO annotations will be inserted into a JSON file. 

## Installation guide for Ubuntu 16.04
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

## Setting up as a service
<TODO>
    
## Feature Guide
### Roles
This software is limited/catered to _multiple_ human annotators and _one_ admin. 

#### Admin
 - Login to admin panel via http://localhost:55555/login with default username:`admin` and password:`password`. 
 - When an image is annotated, the image will be shown on the canvas. You can choose to Approve or Reject the annotation. 
 - If you want to view the current annotated data for all approved images, click on the button labelled _Download JSON_.
    - Note: the polygon coordinates are denormalised. 
 - Click configuration to go to the configuration page. 
    - On the general section, you can see the statistics of images
    - Ideally, everything should be 0 except Approved
    - You can clear images by clicking on the clear staging data.
        - Note: It is very imporant to ensure that you clear the data when you change your classes. Pleas remember the clearing data would delete your annotations.

 - You can add images forannotation at ./images/image_pool/.
 - Add annotators at ./users/users.js. Edit the `ALL_USERS` list to add more annotators.
    - Note: Restart server when adding new users.

#### Annotaters
 - Browse to http://localhost:55555/home and click start.
