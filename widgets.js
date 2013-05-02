exports.widgets = [
  { name: 'ActivityIndicator',
    description: 'An activity indicator is a visual indicator of progress in some operation. It shows a cyclic animation without an indication of progress. It is used when the length of the task is unknown.',
    properties: [
      ['inProgress', 'Sets if the indicator is still on or off. If set to false, it doesn\'t delete the widget just dismisses it. Values: true (default) or false.']
    ]
  },
  { name: 'Button',
    description: 'A button is a widget that represent a physical button that can be pressed.',
    properties: [
      ['text', 'Sets or gets the text that is displayed in the label.'],
      ['textVerticalAlignment', 'Sets the vertical alignment of the text inside the button. Values: top, center (default), bottom.'],
      ['textHorizontalAlignment', 'Sets the horizontal alignment of the text inside the button. Values: left, center (default), right.'],
      ['fontColor', 'Sets the font color of the button\'s text. Value: any hex color values, i.e. the pink color is "#FF00FF"'],
      ['fontSize', 'Sets the font size in points of the button\'s text. Value: any integers.'],
      ['fontHandle', 'Sets the typeface and style in which the text should be displayed.']
    ]
  },
  { name: 'CameraPreview',
    description: 'A Camera preview widget is a widget that can bound to a camera and contain the live view data from the camera.'
  },
  { name: 'CheckBox',
    description: 'A check box is a widget that acts like a physical switch. When pressed it will toggle its internal state that can either be checked or non-checked. If you want to display it with a "light" indicator, as it is on iOS use a Toggle Button instead.',
    properties: [
      ['checked', 'Set or get the checked state of the checkbox. Values: true or false (default).']
    ]
  },
  { name: 'DatePicker',
    description: 'A Date Picker is a widget for selecting a date. The date can be selected by a year, month, and day spinners. The minimal and maximal date from which dates to be selected can be customized. The picker is initialized with the current system date.',
    properties: [
      ['maxDate', 'Sets or gets maximal date supported by this DatePicker in milliseconds since January 1, 1970 00:00:00. NOTE: On Android the default maximal date is 12/31/2100. NOTE: The property can be set on iOS only.'],
      ['minDate', 'Sets or gets minimal date supported by this DatePicker in milliseconds since January 1, 1970 00:00:00 Note: On Android the default minimal date is 01/01/1900. NOTE: The property can be set on iOS only.'],
      ['year', 'Sets or gets the currently displayed year.'],
      ['month', 'Sets or gets the currently displayed month.'],
      ['dayOfMonth', 'Sets or gets the currently displayed day of month.']
    ]
  },
  { name: 'EditBox',
    description: 'An editbox is an editable label.',
    properties: [
      ['text', 'Set or get the text entered in the edit box.'],
      ['placeholder', 'Set a text in the edit box that acts as a placeholder when an edit box is empty.'],
      ['showKeyboard', 'Shows or hides the virtual keyboard. If shown the focus will be set to this widget. Values: true or false (default).'],
      ['editMode', 'Specifies what editing mode the edit box should have. Values: "text" (default) or "password".'],
      ['inputMode', 'Specifies what editing mode the edit box should have. Those flags are mutual exclusive, so the previous value is always ignored.',
        [
          '0 (The user is allowed to enter any text, including line breaks)',
          '1 (The user is allowed to enter an e-mail address)',
          '2 (The user is allowed to enter an integer value)',
          '3 (The user is allowed to enter a phone number)',
          '4 (The user is allowed to enter a URL)',
          '5 (The user is allowed to enter a real number value)',
          '6 (The user is allowed to enter any text, except for line breaks. Unavailable on some platforms)'
        ]
      ],
      ['fontColor', 'Sets the font color of the edit box\'s text. Value: any hex color values, i.e. the pink color is "#FF00FF"'],
      ['linesNumber', 'Set the number of lines. Makes the edit box exactly this many lines tall. Note that setting this value overrides any other (minimum / maximum) number of lines or height setting. A single line edit box will set this value to 1. This property will automatically set MAWEDITBOXTYPEANY input mode, so that the edit box will become multiline. Available on Android only.'],
      ['maxLines', 'Makes the edit box at most this many lines tall. Setting this value overrides any other (maximum) height setting. Available on Android only.'],
      ['minLines', 'Makes the edit box at least this many lines tall. Setting this value overrides any other (minimum) height setting. Available on Android only.'],
      ['maxLength', 'Sets or gets the maximum input length of the edit box. Setting this value enables multiline input mode by default. Available on Android only.'],
      ['placeholderFontColor', 'Sets the font color of the placeholder text when an edit box is empty.']
    ]
  },
  { name: 'GL2View',
    description: 'A GL view is a widget that is used to display graphics rendered by the GPU using OpenGL|ES 2.0 calls.' },
  { name: 'GLView',
    description: 'A GL view is a widget that is used to display graphics rendered by the GPU using OpenGL|ES 1.0/1.1 calls.',
    properties: [
      ['invalidate', 'Property that tells the gl view that it should be redrawn.'],
      ['bind', 'Property that tells the gl view that all following gl calls will apply to this view.']
    ]
  },
  { name: 'HorizontalLayout',
    description: 'A horizontal layout is a layout that stacks widgets in the horizontal axis.',
    properties: [
      ['childVerticalAlignment', 'Sets how the children in the layout should be aligned in the vertical axis. Values: Values: top (default), center, bottom.'],
      ['childHorizontalAlignment', 'Sets how the children in the layout should be aligned in the horizontal axis. Values: left (default), center, right.'],
      ['paddingTop', 'Sets the top padding (px).'],
      ['paddingLeft', 'Sets the left padding (px).'],
      ['paddingRight', 'Sets the right padding (px).'],
      ['paddingBottom', 'Sets the bottom padding (px).']
    ]
  },
  // TODO: From here, check values of properties
  { name: 'Image',
    description: 'An image is a widget that can be used to display an image.',
    properties: [
      ['image', 'Sets the image that will be displayed.'],
      ['scaleMode', 'Specifies what type of scaling should be applied to the image.']
    ]
  },
  { name: 'ImageButton',
    description: 'An image button is a button that will also affect the appearance of the background image when pressed.',
    properties: [
      ['text', 'Sets or gets the text that is displayed in the label. Note: It is not available on Android, as native image buttons do not have text attached.'],
      ['textVerticalAlignment', 'Sets the vertical alignment of the text inside the button.'],
      ['textHorizontalAlignment', 'Sets the horizontal alignment of the text inside the button.'],
      ['fontColor', 'Sets the font color of the button\'s text.'],
      ['fontSize', 'Sets the font size in points of the button\'s text.'],
      ['backgroundImage', 'Sets the background image. This will be scaled to fit the whole widget (not keeping the aspect).'],
      ['image', 'Sets the foreground image of the button. This won\'t be scaled at all.'],
      ['fontHandle', 'Sets the typeface and style in which the text should be displayed.']
    ] },
  { name: 'Label',
    description: 'A label is a widget that can be used to display static non-editable text.',
    properties: [
      ['text','Sets or gets the text that is displayed in the label.'],
      ['textVerticalAlignment','Sets the vertical alignment of the text inside the label. If the widget\'s height is WRAP_CONTENT this property has no effect.'],
      ['textHorizontalAlignment','Sets the horizontal alignment of the text inside the label. If the widget\'s height is WRAP_CONTENT this property has no effect.'],
      ['fontColor','Sets the font color of the label\'s text.'],
      ['fontSize','Sets the font size in points of the label\'s text.'],
      ['fontHandle','Sets the typeface and style in which the text should be displayed.'],
      ['maxNumberOfLines','Sets the maximum number of lines used for rendering text. To remove any maximum limit, and use as many lines as needed, set the value of this property to 0']
    ] },
  { name: 'ListView',
    description: 'A list view is a vertical list of widgets that is also scrollable.' },
  { name: 'ListViewItem',
    description: 'A list view item is a special kind of layout compatible with the list view. That has a predefined common layout for adding text, an icon etc.',
    properties: [
      ['text','Sets the text part of the list view item. If there is an icon the text will be placed to the right of it, otherwise near the left edge.'],
      ['icon','Sets an icon of the list view item that is placed to the left of the text.'],
      ['accessoryType','Sets the type of list item displayed. Provides the corresponding icon in the right side of the list view.'],
      ['fontColor','Sets the font color of the text part.'],
      ['fontSize','Sets the font size in points of the text part.'],
      ['fontHandle','Sets the typeface and style in which the text should be displayed']
    ] },
  { name: 'ModalDialog',
    description: 'A dialog is a sort of modal view, that can look different depending on the platform. A Dialog gets visible only after calling maWidgetModalDialogShow(). On Android it is a modal alert dialog. On iPad it is a PopoverController, and on iPhone it is a modal view. When a Dialog widget is created it is empty, it has no content. Any type of widget can be added inside it via maWidgetAddChild syscalls. To show a Dialog call maWidgetModalDialogShow(), to dismiss it call: maWidgetModalDialogHide(), and to delete it call maWidgetDestroy.',
    properties: [
      ['title','Sets or gets the title. If the property receives am empty string then the title bar becomes invisible.'],
      ['arrowPosition','Sets the origin arrow position for a popover dialog. Note: This property is only available on the iPad.'],
      ['userCanDismiss','Allow or prohibits the user from dismissing a popover dialog by tapping outside of it. Note: This property is only available on the iPad']
    ] },
  { name: 'NavBar',
    description: 'A nav bar is an iphone specific widget that shows a nav bar with an optional title and back button.',
    properties: [
      ['title','Sets or gets the title.'],
      ['backBtn','Sets the text for the back button. This can be set only when the navigation bar was attached to a screen that is not part of a stack screen. Note: this is available only on iOS. On Android the back behavior is handled by the device\'s back button.'],
      ['titleFontColor','Sets the font color of the title.'],
      ['titleFontSize','Sets the font size in points of the title.'],
      ['titleFontHandle','Sets the typeface and style in which the title should be displayed']
    ] },
  { name: 'NumberPicker',
    description: 'A Number Picker is a widget that enables the user to select a number from a predefined range. Note: for the moment it is available only on iOS.',
    properties: [
      ['value','Sets or gets the current value for the number picker. If the value is less than MAWNUMBERPICKERMINVALUE property value, the current value is set to min. If the value is greater than MAWNUMBERPICKERMAXVALUE value, the current value is set to max.'],
      ['minValue','Sets or gets the min value of the picker.'],
      ['maxValue','Sets or gets the max value of the picker']
    ] },
  { name: 'PanoramaView',
    description: 'A panorama control is a Windows Phone 7 specific control Available only on Windows Phone 7.',
    properties: [
      ['currentScreen','Sets or gets the currently shown screen to the screen with the given index.'],
      ['backgroundImage','Sets the background image of the view.'],
      ['title','Sets the title of a screen. The screen title is used by tab screen to display a text on the tab indicator']
    ] },
  { name: 'ProgressBar',
    description: 'A progress bar is a visual indicator of progress in some operation. Displays a bar to the user representing how far the operation has progressed. A progress bar can also be made indeterminate, when the length of the task is unknown.',
    properties: [
      ['max','Sets or gets the range of the progress bar to 0..max.'],
      ['progress','Set or gets the current progress to the specified value.'],
      ['incrementProgress','Increase the progress bar\'s progress by the specified amount']
    ] },
  { name: 'RelativeLayout',
    description: 'A relative layout is a layout that layouts widgets relative to its coordinate system.' },
  { name: 'Screen',
    description: 'A screen is the root of all widgets currently visible on a screen. See Screen properties for the properties available.',
    properties: [
      ['title','Sets the title of a screen. The screen title is used by tab screen to display a text on the tab indicator.'],
      ['icon','Sets an icon for a screen. The icon is used by a tab screen to display an icon on the tab indicator']
    ] },
  { name: 'SearchBar',
    description: 'A search bar is a special kind of edit box that is used for searching.',
    properties: [
      ['text','Set or get the current text of the search bar.'],
      ['placeholder','Set a text in the search bar that acts as a placeholder when an edit box is empty.'],
      ['showKeyboard','Shows or hides the virtual keyboard. If shown the focus will be set to this widget']
    ] },
  { name: 'Slider',
    description: 'A Slider is an extension of ProgressBar that adds a draggable thumb. The user can touch the thumb and drag left or right to set the current progress level.',
    properties: [
      ['max','Sets or gets the range of the slider to 0..max.'],
      ['value','Set or gets the current value to the slider.'],
      ['increaseValue','Increase the current value of the slider by the specified amount.'],
      ['decreaseValue','Decreases the current value of the slider by the specified amount']
    ] },
  { name: 'StackScreen',
    description: 'A stack screen is a special type of screen that manages navigation between a set of screens.',
    properties: [
      ['backButtonEnabled','Specifies whether the back button automatically should pop the stack screen.'],
      ['title','Sets the title of a screen. The screen title is used by tab screen to display a text on the tab indicator.'],
      ['icon','Sets an icon for a screen. The icon is used by a tab screen to display an icon on the tab indicator']
    ] },
  { name: 'TabScreen',
    description: 'A tab screen is a special type of screen that can have any number of sub-screens each switchable using a tab bar.',
    properties: [
      ['currentTab','Sets or gets the currently open tab to the tab with the given index.(Get Only)'],
      ['title','Sets the title of a screen. The screen title is used by tab screen to display a text on the tab indicator.'],
      ['icon','Sets an icon for a screen. The icon is used by a tab screen to display an icon on the tab indicator']
    ] },
  { name: 'TimePicker',
    description: 'A Time Picker is a widget for selecting time of day, in 24 hour mode. The hour and each minute digit can be controlled by vertical spinners. The hour can be entered by keyboard input. Available only on iOS for the moment.',
    properties: [
      ['currentHour','Sets or gets the current hour in 24h mode( in the range: 0-23 ).'],
      ['currentMinute','Sets or gets the current minute (0-59)']
    ] },
  { name: 'ToggleButton',
    description: 'A Toggle Button is a widget that acts like a physical switch. Displays checked/unchecked states as a button with a "light" indicator and by default accompanied with the text "ON" or "OFF". It is available only on Android, and it\'s similar to the Check Box on iOS. When pressed it will toggle its internal state that can either be checked or non-checked.',
    properties: [
      ['checked','Set or get the checked state of the toggle button']
    ] },
  { name: 'VerticalLayout',
    description: 'A vertical layout is a layout that stacks widgets in the vertical axis.',
    properties: [
      ['childVerticalAlignment','Sets how the children in the layout should be aligned in the vertical axis.'],
      ['childHorizontalAlignment','Sets how the children in the layout should be aligned in the horizontal axis.'],
      ['paddingTop','Sets the top padding.'],
      ['paddingLeft','Sets the left padding.'],
      ['paddingRight','Sets the right padding.'],
      ['paddingBottom','Sets the bottom padding']
    ] },
  { name: 'VideoView',
    description: 'A Video View displays a video file. By default, it has attached a controller view that typically contains the buttons like "Play/Pause", "Rewind", "Fast Forward" and a progress slider.',
    properties: [
      ['path','Sets the video path. Note: available only for Android.'],
      ['url','Sets the video url.'],
      ['action','Start,pause or stop the video playback.'],
      ['seekTo','Seeks into the video.'],
      ['duration','Gets the video file duration.'],
      ['bufferPercentage','Gets the buffer percentage of the played video file.'],
      ['currentPosition','Gets the current position in the video file.'],
      ['control','Show/hide video control. Default value is \'true\' (video control is shown). Platform: iOS']
    ] },
  { name: 'WebView',
    description: 'A web view is a widget used to render web pages.',
    properties: [
      ['url','Set or get the currently displayed url in the web view.'],
      ['html','Set the currently displayed HTML data in the web view.'],
      ['baseUrl','Set the base URL used by the web-view when loading relative paths. The value of this URL is used when setting the MAWWEBVIEWURL and MAWWEBVIEWHTML properties. The default value for this property points to the Assets folder in the local file system (\'file://pathToLocalFileSystem/Assets/\').'],
      ['softHook','Set the pattern used to \'soft hook\' urls, to get notified when pages are being loaded.'],
      ['hardHook','Set the pattern used to \'hard hook\' urls, to get notified and prevent loading of pages.'],
      ['newurl','Property to get a new url whenever the webview changes the url. See MAWEVENTWEBVIEWURL_CHANGED.'],
      ['horizontalScrollBarEnabled','Sets or gets whether the horizontal scrollbar should be drawn or not. Available only on Android for the moment.'],
      ['verticalScrollBarEnabled','Sets or gets whether the vertical scrollbar should be drawn or not. The scrollbar is drawn by default. Available only on Android for the moment.'],
      ['enableZoom','Enable or disable the zoom controls of the web view.'],
      ['navigate','Navigate forward or back the browsing history']
    ] }
]