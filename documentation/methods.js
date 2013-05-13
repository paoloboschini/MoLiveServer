exports.methods = [
  { name: 'mosync.nativeui.create',
    description: 'Creates a widget and returns a mosync.nativeui.NativeWidgetElement object. The object then can be used for modifying the respective NativeElement. Returns an object of type mosync.nativeui.NativeWidgetElement',
    id: 'mosyncnativeuicreate',
    parameters: [
    { name: 'widgetType',
      description: 'type of the widget that should be created'},
    { name: 'widgetID',
      description: 'ID that will be used for refrencing to the widget'},
    { name: 'params',
      description: 'A dictionary that includes a list of properties to be set on the widget'},
    { name: 'successCallback',
      description: '(optional) a function that will be called when the operation is done successfully'},
    { name: 'errorCallback',
      description: '(optional) a function that will be called when the operation encounters an error'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement',
    description: 'A widget object that user can interact with instead of using the low level functions. This class is not used directly: see mosync.nativeui.create for usage.',
    id: 'mosyncnativeuiNativeWidgetElement',
    parameters: [
      { name: 'widgetType',
        description: 'Type of the widget that has been created'},
      { name: 'widgetID',
        description: 'ID of the widget used for identifying the widget (can be ignored by the user)'},
      { name: 'params',
        description: 'A dictionary that includes a list of properties to be set on the widget'},
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'document.getNativeElementById',
    description: 'Used to access the nativeWidgetElements created from the HTML markup. It returns the object that can be used to change the properties of the specified widget',
    id: 'documentgetNativeElementById',
    parameters: [
      { name: 'widgetID',
        description: 'the ID attribute used for identifying the widget in DOM'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.setProperty',
    description: 'Sets a property to the widget in question',
    id: 'mosyncnativeuiNativeWidgetElementsetProperty',
    parameters: [
      { name: 'property',
        description: 'name of the property'},
      { name: 'value',
        description: 'the value'},
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.getProperty',
    description: 'Retrieves a property and call the respective callback',
    id: 'mosyncnativeuiNativeWidgetElementgetProperty',
    parameters: [
      { name: 'property',
        description: 'name of the property'},
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful, called with two parameters, property name and property value, for example: function(prop, value) { ... }'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs, takes no parameters'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.addEventListener',
    description: 'Registers an event listener for this widget',
    id: 'mosyncnativeuiNativeWidgetElementaddEventListener',
    parameters: [
      { name: 'eventType',
        description: 'type of the event that the user wants to listen to'},
      { name: 'listenerFunction',
        description: 'a function that will be called when that event is fired'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.addChild',
    description: 'Adds a child widget to the current widget',
    id: 'mosyncnativeuiNativeWidgetElementaddChild',
    parameters: [
      { name: 'childID',
        description: 'the ID for the child widget'},
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.insertChild',
    description: 'Inserts a new child widget in the specified index',
    id: 'mosyncnativeuiNativeWidgetElementinsertChild',
    parameters: [
      { name: 'childID',
        description: 'ID of the child widget'},
      { name: 'index',
        description: 'the index for the place that the new child should be inserted'},
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.removeChild',
    description: 'Removes a child widget from the child list of the current widget',
    id: 'mosyncnativeuiNativeWidgetElementremoveChild',
    parameters: [
      { name: 'childID',
        description: 'Id of the child widget that will be removed'},
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.addTo',
    description: 'Adds the current widget as a child to another widget',
    id: 'mosyncnativeuiNativeWidgetElementaddTo',
    parameters: [
      { name: 'parentId',
        description: 'JavaScript ID of the parent widget'},
      { name: 'successCallback',
        description: '(optional) a function that will be called when the operation is done successfuly'},
      { name: 'errorCallback',
        description: '(optional) a function that will be called when the operation encounters an error'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.clone',
    description: 'Clones the current Widget',
    id: 'mosyncnativeuiNativeWidgetElementclone',
    parameters: [
    { name: 'newID',
      description: 'The ID for the newly created widget'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.show',
    description: 'Shows a screen widget on the screen. Will be set to null if the widget is not of type screen',
    id: 'mosyncnativeuiNativeWidgetElementshow',
    parameters: [
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.pushTo',
    description: 'Pushes a screen to a StackScreen',
    id: 'mosyncnativeuiNativeWidgetElementpushTo',
    parameters: [
    { name: 'stackScreenID',
      description: 'the ID for the stackscreen that should be used for pushing the current screen'},
    { name: 'successCallback',
      description: 'a function that will be called if the operation is successful'},
    { name: 'errorCallback',
      description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.pop',
    description: 'Pops a screen from the current stackscreen, Use only for StackScreen widgets',
    id: 'mosyncnativeuiNativeWidgetElementpop',
    parameters: [
    { name: 'successCallback',
      description: 'a function that will be called if the operation is successful'},
    { name: 'errorCallback',
      description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.showDialog',
    description: 'Shows a modal dialog widget on the screen',
    id: 'mosyncnativeuiNativeWidgetElementshowDialog',
    parameters: [
      { name: 'successCallback',
        description: 'a function that will be called if the operation is successful'},
      { name: 'errorCallback',
        description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.NativeWidgetElement.hideDialog',
    description: 'Hides a modal dialog widget from the screen',
    id: 'mosyncnativeuiNativeWidgetElementhideDialog',
    parameters: [
    { name: 'successCallback',
      description: 'a function that will be called if the operation is successful'},
    { name: 'errorCallback',
      description: 'a function that will be called if an error occurs'}
    ]
  },
  { name: 'mosync.nativeui.setWebViewHandle',
    description: 'Sets the web view widget handle and maps it inside the widgetIDList',
    id: 'mosyncnativeuisetWebViewHandle',
    parameters: [
      { name: 'handle',
        description: 'The handle of the web view widget'}
    ]
  },
  { name: 'mosync.nativeui',
    id: 'mosyncnativeui',
    description: 'This is a class. Please look into the memebers for usage' },
  { name: 'mosync.nativeui.mainWebViewId',
    id: 'mosyncnativeuimainWebViewId',
    description: 'A unique string ID for the main webview widget.' },
  { name: 'mosync.nativeui.getMainWebViewId',
    description: 'Get the id of the main webview. This can be used to insert the main webview into a widget tree. @return The string id of the main webview widget.',
    id: 'mosyncnativeuigetMainWebViewId'
  },
  { name: 'mosync.nativeui.getNativeHandleById',
    id: 'mosyncnativeuigetNativeHandleById',
    description: 'Get the MoSync widget handle for the JavaScript NativeUI element with the given ID',
    parameters: [
      { name: 'elementId',
        description: 'A string id that identifies the widget (this is the ID of the DOM element that holds the widget info)'}
    ]},
  { name: 'mosync.nativeui.MAIN_WEBVIEW',
    id: 'mosyncnativeuiMAIN_WEBVIEW',
    description: 'Constant to be used to reference the main WebView in an app when calling mosync.nativeui.callJS()' },
  { name: 'mosync.nativeui.callJS',
    id: 'mosyncnativeuicallJS',
    description: 'Evaluate JavaScript code in another WebView. This provides a way to pass messages and communicate between WebViews',
    parameters: [
      { name: 'webViewHandle',
        description: 'The MoSync handle of the WebView widget. Use mosync.nativeui.MAIN_WEBVIEW to refer to the main WebView in the application (this is the hidden WebView in a JavaScript NativeUI app).'},
      { name: 'script',
        description: 'A string with JavaScript code.'}
    ]
  },
  { name: 'mosync.nativeui.UIReady',
    description: 'A function that is called when the UI is ready. By default it loads the element with ID "mainScreen" Override this function to add extra functionality. See mosync.nativeui.initUI for more information. After finalizing the widgets, the UI system will call the UIReady function. To add your operation you can override the UIReady function',
    id: 'mosyncnativeuiUIReady'
  },
  { name: 'mosync.nativeui.initUI',
    description: 'Initializes the UI system and parsing of the XML input. This function should be called when the document body is loaded. Returns true on success, false on error',
    id: 'mosyncnativeuiinitUI'
  }
];