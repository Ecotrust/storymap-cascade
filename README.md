### This file replaces Esri's README.md (now at ESRI-README.md)

# README

## Purpose
Since Esri retired the classic storymaps, they offered code (see fork source) to self host. However, the self host solution still relied on:
* Having a valid Esri account ID
* Hosting your data on their servers

This fork aims to walk former users of classic Esri Storymaps through self hosting their archived materials -- not just relying on Esri maintaining an open API.

This fork specifically supports the 'Cascade' template for Classic StoryMaps.

We hope to create similar forks for other types, starting with 'Journal'.

## Requirements
* a server
* knowledge of your storymaps' App IDs
* Access to your preferred ArcGIS OnLine (AGOL)account

## Gather Materials
### This code: 
* (TODO: create zip download)
* clone with git
### Your App Id
* Log in to your organization's AGOL site
* navigate to 'Content' -> 'My content'
    * https://<ORG>.maps.arcgis.com/home/content.html
* Find your StoryMap ('Web mapping application')
* Click on it to open it (or 'view details')
* Find the 'URL' section in the right column
   * confirm it contains with 'Cascade' (this code only works with the 'Cascade' application type)
   * copy the long set of characters after 'appid'
      * https://<ORG>.maps.arcgis.com/apps/Cascade/index.html?appid=<APP_ID>
      * you will need to use this ID a lot later on, so keep it handy
* At the bottom of the right column, note the 'Folder' field
### Your App files
* Navigate to https://assistant.esri-ps.com/content 
* Find your 'Web Mapping Application' and click to open the 'Item Details'
* double check
   * Item ID matches the one you found above
   * URL includes 'Cascade' after "maps.arcgis.com/apps/"
#### JSON
JSON files contain a description about your storymap and a detailed breakdown of how it's constructed.
* Click 'View Item JSON' to open the JSON editor
* Click on 'Description' in the top left
    * copy all text and save it to a file called `description.json`
* Click on 'Data'  in the top left
    * Copy all text and save it to a file called `data.json`
    * NOTE: you need EVERY character exacly as written, so clicking inside the text and using `ctrl+a` to highlight all text and `ctrl+x` to copy it (or the Mac equivalent) will save you some grief.
#### Static Files
Your storymap also likely relies on numerous maps and images to tell its story. You will need to download a copy of those as well.
* Still at 'ArcGIS Assistant' with your storymap selected:
   * Click on 'Resources' in the top right corner of your screen
   * Click on the blue 'Download All' button in the top left corner of your screen.
   * After some time (Esri will zip your files together) a download will begin and you will get a file called `resources.zip`
   * you will need this file in the next step.
### Organize your files
A directory (folder) called `storymaps` should exist adjacent to this README.md file. It contains a README.md file as well. It also will contain a directory for each (Cascade) StoryMap you wish to serve.

* Create a directory with the name of your app ID
* Move your `data.json` into it
* Move your `description.json` into it
* Move your `resources.zip` file into it
   * If you already had a file named `resources.zip` in your downloads folder, this one may be appended with a number, like `resources(1).zip`.
   * Be sure to grab the file with a timestamp that matches when you downloaded this data from Esri to be sure you have the right one
   * __Be sure to rename the file back to `resources.zip` if it does have that number!__
   * unzip `resources.zip` into this directory - it should create a folder called `resources`
#### Confirm your file structure is correct:

/path/to/storymap-cascade/compiled
|- <APP ID> (directory)
  |- data.json
  |- description.json
  |- resources (directory)
    | - (your static files)