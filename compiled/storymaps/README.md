# StoryMaps Directory

Use this directory to download and organize all of the files needed to serve your (Cascade) StoryMap data.

## Collect the following

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
    * NOTE: you need EVERY character exacly as written, so clicking inside the text and using `ctrl+a` to highlight all text and `ctrl+c` to copy it (or the Mac equivalent) will save you some grief.
#### Static Files
Your storymap also likely relies on numerous maps and images to tell its story. You will need to download a copy of images and static files for your server. There may be maps and other dependencies that still rely on ArcGIS services -- this is not a fully offline archive.
* Still at 'ArcGIS Assistant' with your storymap selected:
   * Click on 'Resources' in the top right corner of your screen
   * Click on the blue 'Download All' button in the top left corner of your screen.
   * After some time (Esri will zip your files together) a download will begin and you will get a file called `resources.zip`
   * you will need this file in the next step.
### Organize your files
This file is inside of a directory called 'storymaps'. Use this director to create a directory for each (Cascade) StoryMap you wish to serve by App ID.

* Create a directory with the name of your app ID
* Move your `data.json` into it
* Move your `description.json` into it
* Move your `resources.zip` file into it
   * If you already had a file named `resources.zip` in your downloads folder, this one may be appended with a number, like `resources(1).zip`.
   * Be sure to grab the file with a timestamp that matches when you downloaded this data from Esri to be sure you have the right one
   * unzip `resources.zip` into this directory - it should create a folder called `resources`
      * __Be sure to rename the filder to `resources` if it does have that number!__

#### Confirm your file structure is correct:

/path/to/storymap-cascade/compiled/storymaps/
* \<APP ID> (directory)
  * data.json
  * description.json
  * resources (directory)
    * (your static files)

## Launch this app
Currently walking you though this is beyond the scope of this document, though in the near future we hope to provide a sample, simple NGINX config file template, if you wish to use NGINX to deploy your storymaps. See the ESRI-README.md file for their recommendations around serving.

## Story ID and startup checks

Open the application with `index.html?appid=<APP_ID>`. Supply exactly one
32-character hexadecimal ArcGIS item ID. IDs in the URL are normalized to
lowercase; name the corresponding story directory in lowercase.

Startup checks require valid `description.json` and `data.json` files inside
that directory. The description's `id` must match the folder name and include
a numeric `created` timestamp. The data must contain the Cascade `values`
configuration, settings, template, and nonempty sections.

The application also checks the local copies of resources referenced by that
story's ArcGIS item-resource URLs. The web server must support GET for JSON
files and HEAD for resource files. Missing files, invalid data, and network
errors stop startup and display an error. An unused resources directory cannot
be verified by these file checks.

These are startup checks only; loading the archived content into the viewer
is a separate integration step.