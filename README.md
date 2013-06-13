#Server and Web Application for live mobile programming#

This is a web application for creating and editing mobile applications live with support for both web technologies (HTML5/JavaScript) and the [MoSync][1] SDK for creating Native UI applications using JavaScript and/or accessing services on a mobile device through HTML5/JavaScript.

##Feedback##

I am doing this project for my Master's Thesis at Uppsala University, Sweden.
It takes 5-10 minutes to download and try out the tool. Give it a go and let me know what you think!
You can click [here][7] to fill out a form.
I will be very happy to get your feedback! :)

##Screencast##

Check this [video][6] for a demonstration on how to use this application.

##Installation##

 1. Make sure you have a working version of [NodeJS][2] installed on you machine
 2. Clone this repository and enter the LiveServer directory
 3. Launch the server app with ***node app.js***
 3. Open the web app at [http://localhost:5678][4]
 4. Install the [Live Mobile App][3] on your mobile device (or simulator), open it, and enter the server ip number displayed in the web application in the url field

Note 1: if you don't want to build the Live Mobile App yourself, you can download the Android package [Live.apk][5] and install it on your mobile device. You can download it right from you Android mobile by opening this page from you mobile browser and click on the [Live.apk][5] link.

Note 2: For iOS and Windows Phone you need to compile the mobile app yourself using the [MoSync SDK][1] and install it on your mobile device.

##Usage##
The system can be used in different ways:

1. **Non-live programming (Live checkbox OFF)**
  1. Write HTML and/or JavaScript in the editors and re-run the app clicking on the Restart button. In this way the JavaScript runtime is restored every time you restart the app, so no state is preserved.

  2. Mark a piece of JavaScript code and right-click on it to execute it in the current runtime of the mobile device. In this way the JavaScript runtime is preserved.

2. **Live programming (Live checkbox ON)**
  1. When changing HTML the app is restarted automatically showing the new changes.

  2. When changing code of a top-level expression in the JavaScript editor, the code is executed immediately in the runtime of the mobile device.

##Features##

 - Templates (support for adding custom templates is still missing)
 - GitHub authentication for loading Gists
 - Create new files and save your Gists
 - Autocompletion for both HTML and JavaScript
 - Context-aware autocompletion for MoSync Native Widgets
 - Manually evaluate portion of JavaScript code as in Smalltalk
 - Live programming (code changes evaluate the top level expressions and function declarations). The code to be evaluated is marked in bold text
 - Add resources (images, sounds...) to use with MoSync Native Widgets
 - Live JavaScript linting (JSHint is used)
 - Change numbers with a slider to quickly customise the UI on the device
 - Change colours with a color palette to quickly customise the UI on the device

[1]: http://www.mosync.com/
[2]: http://nodejs.org/
[3]: https://github.com/paoloboschini/MoLive
[4]: https://localhost:5678
[5]: https://github.com/paoloboschini/MoLive/blob/master/AndroidPackage/Live.apk
[6]: http://www.youtube.com/watch?v=uqsxRTx0Iv8
[7]: https://docs.google.com/forms/d/1U1tFal2g6pwXG04eg-YPeWgBXbDwEwxBtkvxQKEEIrw/edit