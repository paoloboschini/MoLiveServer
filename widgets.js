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
  { name: 'Image',
    description: 'An image is a widget that can be used to display an image.',
    properties: [
      ['image', 'Sets the image that will be displayed.'],
      ['scaleMode', 'Specifies what type of scaling should be applied to the image.']
    ]
  },
  { name: 'ImageButton',
    description: 'An image button is a button that will also affect the appearance of the background image when pressed.' },
  { name: 'Label',
    description: 'A label is a widget that can be used to display static non-editable text.' },
  { name: 'ListView',
    description: 'A list view is a vertical list of widgets that is also scrollable.' },
  { name: 'ListViewItem',
    description: 'A list view item is a special kind of layout compatible with the list view. That has a predefined common layout for adding text, an icon etc.' },
  { name: 'ModalDialog',
    description: 'A dialog is a sort of modal view, that can look different depending on the platform. A Dialog gets visible only after calling maWidgetModalDialogShow(). On Android it is a modal alert dialog. On iPad it is a PopoverController, and on iPhone it is a modal view. When a Dialog widget is created it is empty, it has no content. Any type of widget can be added inside it via maWidgetAddChild syscalls. To show a Dialog call maWidgetModalDialogShow(), to dismiss it call: maWidgetModalDialogHide(), and to delete it call maWidgetDestroy.' },
  { name: 'NavBar',
    description: 'A nav bar is an iphone specific widget that shows a nav bar with an optional title and back button.' },
  { name: 'NumberPicker',
    description: 'A Number Picker is a widget that enables the user to select a number from a predefined range. Note: for the moment it is available only on iOS.' },
  { name: 'PanoramaView',
    description: 'A panorama control is a Windows Phone 7 specific control Available only on Windows Phone 7.' },
  { name: 'ProgressBar',
    description: 'A progress bar is a visual indicator of progress in some operation. Displays a bar to the user representing how far the operation has progressed. A progress bar can also be made indeterminate, when the length of the task is unknown.' },
  { name: 'RelativeLayout',
    description: 'A relative layout is a layout that layouts widgets relative to its coordinate system.' },
  { name: 'Screen',
    description: 'A screen is the root of all widgets currently visible on a screen. See Screen properties for the properties available.' },
  { name: 'SearchBar',
    description: 'A search bar is a special kind of edit box that is used for searching.' },
  { name: 'Slider',
    description: 'A Slider is an extension of ProgressBar that adds a draggable thumb. The user can touch the thumb and drag left or right to set the current progress level.' },
  { name: 'StackScreen',
    description: 'A stack screen is a special type of screen that manages navigation between a set of screens.' },
  { name: 'TabScreen',
    description: 'A tab screen is a special type of screen that can have any number of sub-screens each switchable using a tab bar.' },
  { name: 'TimePicker',
    description: 'A Time Picker is a widget for selecting time of day, in 24 hour mode. The hour and each minute digit can be controlled by vertical spinners. The hour can be entered by keyboard input. Available only on iOS for the moment.' },
  { name: 'ToggleButton',
    description: 'A Toggle Button is a widget that acts like a physical switch. Displays checked/unchecked states as a button with a "light" indicator and by default accompanied with the text "ON" or "OFF". It is available only on Android, and it\'s similar to the Check Box on iOS. When pressed it will toggle its internal state that can either be checked or non-checked.' },
  { name: 'VerticalLayout',
    description: 'A vertical layout is a layout that stacks widgets in the vertical axis.' },
  { name: 'VideoView',
    description: 'A Video View displays a video file. By default, it has attached a controller view that typically contains the buttons like "Play/Pause", "Rewind", "Fast Forward" and a progress slider.' },
  { name: 'WebView',
    description: 'A web view is a widget used to render web pages.' }
]