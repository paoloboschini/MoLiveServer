#Online Editor for live mobile programming#

This is a web application for creating and editing mobile applications live with support for both web technologies (HTML5/JavaScript) and the [MoSync][1] SDK for creating Native UI applications using JavaScript and/or accessing services on a mobile device through HTML5/JavaScript.

##Installation##

 1. Clone the repo, make sure you have a working version of [NodeJS][2] installed on you machine, and launch the server app with ***node app.js***;
 2. Open the web app at http://localhost:5678;
 3. Install the Live Mobile App on your mobile device, open it, and open 
http://localhost:5678/mobile or whatever the ip of your server is

Note 1: if you don't want to build the mobile app yourself, you can install the android package that resides in the output directory of the [mobile app repository][3]  on your device. The mobile does not work on the android simulator.

Note 2: For iOS and Windows mobile you need to compile the mobile app yourself and install it on your device. The mobile app *should* work on most mobile devices, it works on the iOS simulator.

<!--
###Adding images###
![alt text][4]
-->

##Features##
The web application has a number of features:

 - Templates (support for adding custom templates is still missing)
 - GitHub authentication for loading Gists
 - Create new and save your Gists
 - Autocompletion for both HTML and JavaScript
 - Context-aware autocompletion for MoSync Native Widgets
 - Manually evaluate portion of JavaScript code as in Smalltalk
 - Live programming (code changes evaluate the top level expressions and function declarations). The code to be evaluated is marked in bold text
 - Add resources (images, sounds...) to use with MoSync Native Widgets
 - Live JavaScript linting (JSHint is used)
 - Change numbers with a slider to quickly customise a UI on the device
 - Change colours with a color palette to quickly customise a UI on the device

##Usage##
There are two main modes:

1. **Non-live programming**
  1. Write your HTML and/or JavaScript mobile app and re-run the app pressing the Restart button. In this way the JavaScript runtime is restored every time you restart the app.
  2. Mark a piece of JavaScript code and right-click on it to execute in the current runtime of the mobile device. 

2. **Live programming**
  When changing code to a top-level expression, the code is executed immediately in the run time of the mobile device.

[1]: http://www.mosync.com/
[2]: http://nodejs.org/
[3]: https://github.com/paoloboschini/Live