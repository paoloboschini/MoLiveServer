/*
 * Debug-JS The JavaScript Debugging Tool
 *
 * Version 0.50b-r42
 *
 * @author Matias Mirabelli <admin@moyrax.com>
 */
Debugger = {};

/**
 * Basic Debugger operations. This operations will be used by the core.
 *
 * @since 0.11
 */
Debugger.Utils = {
  /**
   * Extends an object with another. If a method exists in the target
   * object, it will be overriden and the first parameter of the new
   * method will be the overriden method.
   *
   * @param toObject {Object} Target object.
   * @param fromObject {Object} Source object.
   */
  extend : function(toObject, fromObject) {
    for (var property in fromObject) {
      if (fromObject.hasOwnProperty(property)) {
        if (!toObject[property]) {
          toObject[property] = fromObject[property];
        } else if (toObject[property] instanceof Function) {
          // If the method exists, creates a proxy.
          toObject[property] = this.wrap(toObject[property],
                                         fromObject[property]);
        }
      }
    }
  },

  wrap : function (aMethod, aWrapper) {
    return function () {
      var _arguments = new Array(arguments.length);

      for (var i = 0, j = arguments.length; i < j; i++) {
        _arguments[i] = arguments[i];
      }

      _arguments = [aMethod].concat(_arguments);

      return aWrapper.apply(this, _arguments);
    };
  }
};

/**
 * This is the public interface for Debugger object.
 *
 * @since 0.10
 */
Debugger.Utils.extend(Debugger, function() {
  /**
   * Debugger plugins.
   *
   * @type Array[Object]
   */
  var _plugins = [];

  /**
   * Is debugger enabled?
   *
   * @type Boolean
   */
  var _enabled = false;

  /**
   * Global context to be used when no context be specified.
   *
   * @type Debugger.Context
   */
  var globalContext = null;

  /* Visible interface. */
  var publicInterface = {
    /**
     * Initializes the debugger interfaces.
     */
    setup : function() {
      if (_enabled) {
        return;
      }

      if (!Object.prototype) {
        Object.prototype = {};
      }

      Debugger.Utils.extend(Object.prototype, Debugger.Prototype);

      _enabled = true;
    },

    /**
     * Attach the debugger to an specific object instead of extends the native
     * Object prototype. This attachment mode is useful when Debug-JS is used
     * together with other frameworks that uses prototype-based inheritance.
     *
     * @param anObject {Object} Object to be debugged.
     * @param aContext {Debugger.Context} Optional. Context object.
     */
    attach : function (anObject, aContext) {
      Debugger.Prototype.debug.apply(anObject, [aContext]);

      _enabled = true;
    },

    /**
     * Release the debugger from the specified object, if it's being debugged.
     *
     * @param anObject {Object} Object to be released from the debugger.
     */
    detach : function (anObject) {
      if (!this.isDebugging(anObject)) {
        this.raiseError("Debugger is not attached to the specified object.");
      }

      var entry = Debugger.Cache.get(anObject);

      entry.restore();

      Debugger.Cache.release(anObject);
    },

    /**
     * Returns <code>true</code> if the specified object is being debugged.
     *
     * @param anObject {Object} Object to check if is in debugging mode.
     */
    isDebugging : function (anObject) {
      return Debugger.Cache.exists(anObject);
    },

    /**
     * Returns <code>true</code> if the debugger is enabled.
     */
    isEnabled : function() {
      return _enabled;
    },

    /**
     * Plugin management object.
     */
    Plugins : {
      /**
       * Adds a plugin to the debugger.
       *
       * @param thePluginType {Debugger.PluginType} Plugin type.
       * @param aPlugin {Object} Plugin object.
       */
      add : function(thePluginType, aPlugin) {
        if (!_plugins[thePluginType]) {
          _plugins[thePluginType] = [];
        }

        _plugins[thePluginType].push(aPlugin);

        return _plugins[thePluginType];
      },
      /**
       * Calls to the specified types of plugins and gives
       * debugging data to them.
       *
       * @param thePluginType {Debugger.PluginType} Plugin type to execute.
       * @param anEvent {Debugger.Events} Current event type.
       * @param theData {Object} Debugging data.
       */
      call : function(thePluginType, anEvent, theData) {
        var plugins = _plugins[thePluginType];

        if (!plugins && (thePluginType == Debugger.PluginType.DEBUGGING)) {
          plugins = this.add(Debugger.PluginType.DEBUGGING,
                             new Debugger.GenericDebugger());
        } else if (!plugins) {
          return;
        }

        theData.event = anEvent;

        for (var i = 0, j = plugins.length; i < j; i++) {
          if (plugins[i][anEvent]) {
            plugins[i][anEvent](theData);
          } else {
            plugins[i].execute(theData);
          }
        }
      },

      /**
       * Creates a new Debugger proxy. A proxy is the basic control unit
       * which will be used in the debugging process to wrap functions.
       *
       * @param aSuperClass {Function} Parent plugin, if it exists.
       * @param thePlugin {Object} Prototype of the new plugin.
       */
      create : function (aSuperClass, thePlugin) {
        var $super = aSuperClass ;
        var prototype = thePlugin;

        /* Checks if a superclass was specified. */
        if (arguments.length === 1) {
          $super = null;
          prototype = aSuperClass;
        }

        var Plugin = function() {};

        if ($super) {
          var klass = function () {};

          klass.prototype = $super.prototype;
          Plugin.prototype = new klass();
        }

        Debugger.Utils.extend(Plugin.prototype, prototype);

        return Plugin;
      },

      /**
       * Creates a new Debugger proxy and register it in the system.
       *
       * @param thePluginType {Debugger.ProxyType} Type of plugin.
       * @param aSuperClass {Debugger.Proxy} Parent plugin, if it exists.
       * @param thePlugin {Object} Prototype of the new plugin.
       */
      register : function (thePluginType, aSuperClass, thePlugin) {
        var Plugin = this.create(aSuperClass, thePlugin);
        var _inst = new Plugin();

        this.add(thePluginType, _inst);

        return _inst;
      }
    },

    /**
     * Throws an error.
     *
     * @param theErrorStr {String} Error string.
     * @param aSource     {String} Error source.
     */
    raiseError : function (theErrorStr, aSource) {
      var _errStr = theErrorStr;

      if (aSource) {
        _errStr = "[" + aSource + "] " + _errStr;
      }

      throw _errStr;
    },

    /**
     * Detach the debugger from all objects and free all debugging
     * resources. The Debugger needs to be initialized again in
     * order to enable it.
     */
    disable : function() {
      if (!_enabled) {
        Debugger.raiseError("Debugger is not enabled.");
      }

      Debugger.Cache.free(function(anEntry) {
        anEntry.restore();
      });

      for (var property in Debugger.Prototype) {
        if (Debugger.Prototype.hasOwnProperty(property)) {
          if (Object[property]) {
            delete Object[property];
          }
        }
      }

      _enabled = false;
    },

    /**
     * Sets the global Context object that will be used when no context be
     * specified at the moment of starting a new debugging session.
     *
     * @param aContext {Debugger.Context}  Global context object.
     */
    setGlobalContext : function (aContext) {
      if (aContext instanceof Debugger.Context) {
        globalContext = aContext;
      }
    },

    /**
     * Returns the default Context object defined for the Debugger. It will be
     * used when no context be specified at the momento of starting debugging
     * session.
     */
    getGlobalContext : function () {
      return globalContext;
    }
  };

  return publicInterface;
}());

/**
 * This object will be used in order to extend the native Object prototype,
 * when the prototype-based attachment is being used. It has the shared and
 * global methods for debugging objects.
 *
 * @since 0.10
 */
Debugger.Prototype = {
  /**
   * Attachs the debugger to this object.
   *
   * @param aContext {Debugger.Context} Related Context object.
   * @since 0.10
   */
  debug : function(aContext) {
    /* If no context was specified, uses the default one. */
    if (!aContext) {
      aContext = Debugger.getGlobalContext();
    }

    /* Checks for a valid context. */
    if (!(aContext instanceof Debugger.Context)) {
      throw 'Invalid Context specified.';
    }

    /* Is this context enabled for debugging? */
    if (!aContext || !aContext.enableDebugging) {
      return;
    }

    /* Objects cannot be attached twice. */
    if (Debugger.Cache.exists(this)) {
      Debugger.raiseError("Object is already being debugged.");
    }

    Debugger.Cache.add(this);

    aContext.addTarget(this);

    /* Initializes the debugger in this object. */
    for (var property in this) {
      if (this.hasOwnProperty(property)) {
        if (this[property] instanceof Function) {
          this[property] = aContext.wrap(this, this[property], property);

        } else if (this[property] && aContext.intrusive &&
                   (this[property].constructor === Object) ) {
          // Intrusive mode. Debugger attachs to object-type attributes.
          Debugger.attach(this[property], aContext);
        }
      }
    }
  }
};

/**
 * Debugging events.
 *
 * @since 0.10
 */
Debugger.Events = {
  /**
   * Error throwed.
   *
   * @since 0.10
   */
  ERROR     : "error",

  /**
   * Before the method execution.
   *
   * @since 0.10
   */
  PROLOG    : "prolog",

  /**
   * After the method execution.
   *
   * @since 0.10
   */
  EPILOG    : "epilog",

  /**
   * Push a frame in the stack.
   *
   * @since 0.10
   */
  PUSH      : "push",

  /**
   * Removes a frame from the stack.
   *
   * @since 0.10
   */
  POP       : "pop"
};

/**
 * Plugin types.
 *
 * @since 0.10
 */
Debugger.PluginType = {
  DEBUGGING : 1,
  TRACING   : 2,
  PROFILING : 3,
  UTILITY   : 4,
  ADAPTER   : 5
};

/**
 * @class The <code>Context</code> class is the standard debugging unit. This
 * class keeps all debugging data for an object that's being debugged, as well
 * as debug events handlers.
 *
 * @param defaultErrorHandler {Function} Default error handler.
 *
 * @author Matías Mirabelli
 * @since 0.10
 */
Debugger.Context = function(defaultErrorHandler) {
  /**
   * Debugging targets.
   *
   * @type Array[Object]
   */
  var _objects = [];

  /**
   * Event handlers.
   *
   * @type Array
   */
  var _handlers = [];

  /**
   * Executes handlers for the specified event and gives the proper
   * data to the handlers.
   *
   * @param anEvent {String} Event fired.
   * @param aSource {Object} Object that fires the event.
   * @param theData {Object} Event specific data.
   */
  var _execHandlers = function(anEvent, aSource, theData) {
    var eventObj = new Debugger.Event(anEvent, aSource, theData);
    var items = _handlers[anEvent];

    for (var i = 0, j = items.length; i < j; i++) {
      items[i].apply(aSource,[eventObj]);
    }
  };

  var publicInterface = {
    /**
     * Sets or retrieves if an object is in <i>tracing mode</i>. In this mode
     * the context will be notified on every method call.
     *
     * @type Boolean
     */
    enableTracing : false,

    /**
     * Sets or retrieves if an object is in <code>profiling mode</code>. In
     * this mode, all calls to the object's methods will be logged and
     * additional information will be saved.
     *
     * @type Boolean
     */
    enableProfiling : false,

    /**
     * Sets or retrieves if an object is in <code>debugging mode</code>. In
     * this mode, all debugging events will be dispatched to the registered
     * handlers. If this property is set to false, the related object will
     * act as it hasn't the debugger attached.
     *
     * @type Boolean
     */
    enableDebugging : true,

    /**
     * Sets or retrieves if the debugger will be attached recursively to
     * the the object-type attributes of the related object.
     *
     * @type Boolean
     */
    intrusive : false,

    /**
     * Method call stack. This will be managed by the tracert plugins.
     *
     * @type Array[Object]
     */
    stack : [],

    /**
     * Sets the target object that's being debugging. Once the target object is
     * defined, it couldn't be changed later.
     *
     * @param theObject {Object} Related object to this wrapper.
     */
    addTarget : function(theObject) {
      _objects.push(theObject);
    },

    /**
     * Adds an event handler. The event must be one of defined in
     * <code>Debugger.Events</code>.
     */
    addHandler : function(anEvent, theHandler) {
      if (!_handlers[anEvent]) {
        _handlers[anEvent] = [];
      }

      _handlers[anEvent].push(theHandler);
    },

    /**
     * Adds an error handler.
     *
     * @param anErrorHandler {Function} Error handler.
     */
    onError : function(anErrorHandler) {
      this.addHandler(Debugger.Events.ERROR, anErrorHandler);
    },

    /**
     * This is the debugger core. The <code>wrap</code> method
     * will change the real method of an object for a proxy
     * function. The wrapper function will handle all debugging
     * events.
     *
     * @param theMethod {Function} Object-related method.
     * @param theName {String}  Name of the method.
     */
    wrap : function(theObject, theMethod, theName) {
      var me = this;

      // Returns a proxy.
      return function() {
        var result;
        var _data = {
          context : me,
          method  : theMethod,
          name    : theName
        };

        try {
          Debugger.Plugins.call(Debugger.PluginType.DEBUGGING,
                                Debugger.Events.PROLOG, _data);
          if (me.enableProfiling) {
            Debugger.Plugins.call(Debugger.PluginType.PROFILING,
                                  Debugger.Events.PROLOG, _data);
          }

          result = theMethod.apply(theObject, arguments);

          Debugger.Plugins.call(Debugger.PluginType.DEBUGGING,
                                Debugger.Events.EPILOG, _data);

          if (me.enableProfiling) {
            Debugger.Plugins.call(Debugger.PluginType.PROFILING,
                                  Debugger.Events.EPILOG, _data);
          }
        } catch(err) {
          if (me.enableDebugging) {
            var debugError = new Debugger.Error(this, err, me.stack);

            _execHandlers(Debugger.Events.ERROR, this, debugError);
          } else {
            // If the debugger is disabled, just throws an exception.
            // TODO Is there a way to do that in behalf of the method?
            Debugger.raiseError(err.toString());
          }
        }

        return result;
      };
    },

    /**
     * Pushs a method into the stack.
     *
     * @param theMethod {Function} Method to put in the stack.
     * @param theName {String}  Name of the method.
     */
    push : function(theMethod, theName) {
      if (this.enableTracing) {
        // Executes the tracing plugins.
        var tracingData = {
          method      : theMethod,
          methodName  : theName,
          wrapper     : this
        };

        Debugger.Plugins.call(Debugger.PluginType.TRACING,
                              Debugger.Events.PUSH, tracingData);

        if (this.enableProfiling) {
          Debugger.Plugins.call(Debugger.PluginType.PROFILING,
                                Debugger.Events.PUSH, tracingData);
        }
      }
    },

    /**
     * Removes the last method from the stack.
     */
    pop : function() {
      if (this.enableTracing) {
        var tracingData = {
          context : this
        };

        Debugger.Plugins.call(Debugger.PluginType.TRACING,
                              Debugger.Events.POP, tracingData);

        if (this.enableProfiling) {
          Debugger.Plugins.call(Debugger.PluginType.PROFILING,
                                Debugger.Events.POP, tracingData);
        }
      }
    }
  };

  if (defaultErrorHandler) {
    publicInterface.onError(defaultErrorHandler);
  }

  Debugger.Utils.extend(this, publicInterface);

  return this;
};

/**
 * Kept only for backward compatibility with previous versions.
 *
 * @deprecated
 * @since 0.12
 */
Debugger.Wrapper = Debugger.Context;

/**
 * @class The <code>Event</code> class represents a debugging event.
 * An instance of <code>Event</code> will be given to any
 * event handler registered in the debugger wrappers.
 *
 * @param anEvent   {String} Event fired.
 * @param theSource {Object} Object that fires the event.
 * @param theData   {Object} Event specific data.
 *
 * @author Matías Mirabelli <admin@moyrax.com>
 * @since 0.10
 */
Debugger.Event = function(anEvent, theSource, theData) {
  var publicInterface = {
    eventId : anEvent,
    source  : theSource,
    data    : theData
  };
  return publicInterface;
};

/**
 * @class The <code>Error</code> internal class extends the native
 * Error object with debugging information.
 *
 * @param theSource {Object} Object that causes the error.
 * @param theError  {Error}  Native error.
 * @param theStack  {Array}  Context stack.
 *
 * @author Matías Mirabelli <admin@moyrax.com>
 * @since 0.10
 */
Debugger.Error = function(theSource, theError, theStack) {
  var publicInterface = {
    error  : theError,
    stack  : theStack,
    source : theSource
  };
  return publicInterface;
};

/**
 * @class The <code>Debugger.Cache</code> object will hold the debugging objects
 * in order to retrieve and release its debugging resources when the debug
 * session is detached from the objects.
 *
 * @author Matías Mirabelli <admin@moyrax.com>
 * @since 0.11
 */
Debugger.Cache = function () {
  /**
   * Debugging objects cache.
   *
   * @type Array[Debugger.Cache.Entry]
   */
  var _cache = [];

  /* Visible interface. */
  var publicInterface = {
    /**
     * Returns <code>true</code> if the specified object
     * exists in the cache.
     *
     * @param anObject {Object} Object to test.
     */
    exists : function(anObject) {
      return this.get(anObject) ? true : false;
    },

    /**
     * Adds the specified object to the cache.
     *
     * @param anObject {Object} Object to put into the cache.
     */
    add : function (anObject) {
      _cache.push(new Debugger.Cache.Entry(anObject));
    },

    /**
     * Returns the <code>Cache.Entry</code> instance related to the
     * specified object, if it exists, otherwise returns null.
     *
     * @param anObject {Object} Object related to the required Entry.
     * @returns {Debugger.Cache.Entry}
     */
    get : function (anObject) {
      for (var i = 0, j = _cache.length; i < j; i++) {
        if (_cache[i] && (_cache[i].getObject() === anObject)) {
          return _cache[i];
        }
      }
      return null;
    },

    /**
     * Release the specified object from the cache, if it exists.
     *
     * @param anObject {Object} Object to release.
     */
    release : function (anObject) {
      if (!this.exists(anObject)) {
        return;
      }

      for (var i = 0, j = _cache.length; i < j; i++) {
        if (_cache[i].getObject() === anObject) {
          delete _cache[i];

          break;
        }
      }
    },

    /**
     * Gives to a callback each Entry in this cache.
     *
     * @param aCallback {Function} Function that will be called.
     * @param theSource {Object} Object on behalf to execute the callback.
     */
    each : function (aCallback, theCaller) {
      for (var i = 0, j = _cache.length; i < j; i++) {
        if (_cache[i]) {
          aCallback.apply(theCaller || window, [_cache[i], i]);
        }
      }
    },

    /**
     * Releases all objects in this cache and free resources.
     *
     * @param aProxy {Function} Function called before release each item.
     */
    free : function (aProxy) {
      for (var i = 0, j = _cache.length; i < j; i++) {
        if (_cache[i]) {
          aProxy(_cache[i]);

          delete _cache[i];
        }
      }
    }
  };

  return publicInterface;
}();

/**
 * @class The <code>Entry</code> class keep track of debugging objects in order
 * to restore its previous state and free debugging resources when Debugger
 * detachs an object.
 *
 * @author Matías Mirabelli <admin@moyrax.com>
 * @since 0.11
 */
Debugger.Cache.Entry = function(anObject) {
  var _methods = [];
  var _object = anObject;

  var publicInterface = {
    /**
     * Returns the object related to this cache item.
     *
     * @returns {Object}
     */
    getObject : function() {
      return _object;
    },

    /**
     * Restores the object to the initial state.
     */
    restore : function() {
      for (var property in _methods) {
        if (_methods.hasOwnProperty(property) &&
            _object.hasOwnProperty(property)) {
          _object[property] = _methods[property];
        }
      }
    }
  };

  for (var property in anObject) {
    if (anObject.hasOwnProperty(property) &&
        typeof _object[property] === "function") {
      _methods[property] = _object[property];
    }
  }

  return publicInterface;
};

/**
 * @class Default debugger plugin.
 *
 * @author Matías Mirabelli <admin@moyrax.com>
 * @since 0.11
 */
Debugger.GenericDebugger = Debugger.Plugins.create(null, {
  /**
   * Called before the wrapper executes the original method.
   *
   * @param theData {Object} Data passed by the wrapper.
   */
  prolog : function (theData) {
    if (theData.context.enableDebugging) {
      theData.context.push(theData.method, theData.name);
    }
  },

  /**
   * Called after the wrapper executes the original method.
   *
   * @param theData {Object} Data passed by the wrapper.
   */
  epilog : function (theData) {
    if (theData.context.enableDebugging) {
      theData.context.pop();
    }
  }
});

/**
 * This namespace will hold the Debug-JS library adapters.
 *
 * @type Object
 */
Debugger.Adapter = {};
/**
 * Debug-JS Tracing support plugin.
 *
 * @author Matias Mirabelli <admin@moyrax.com>
 */
Debugger.Tracert = Debugger.Plugins.register(Debugger.PluginType.TRACING, null,
                                             function() {
  /**
   * Represents a stack frame. The stack will hold this type
   * of objects.
   *
   * @param theMethod {Function} Method related to this stack frame.
   * @param theName {String}  Name of the method.
   */
  var StackFrame = function(theMethod, theName) {
    var publicInterface = {
      /**
       * Method name.
       */
      methodName : theName,
      /**
       * Previous stack frame.
       */
      previous : null,

      toString : function() {
        return this.methodName;
      }
    };
    return publicInterface;
  };

  var publicInterface = {
    /**
     * Pushs a method into the stack.
     *
     * @param theData {Object} Debugging data for this event.
     */
    push : function(theData) {
      var _frame = new StackFrame(theData.method, theData.methodName);
      var _stack = theData.context.stack;

      _frame.previous = _stack.slice(_stack.length - 1)[0];

      _stack.push(_frame);
    },

    /**
     * Removes the last method from the stack.
     *
     * @param theData {Object} Debugging data for this event.
     */
    pop : function(theData) {
      theData.context.stack.pop();
    }
  };

  return publicInterface;
}());
/**
 * Debug-JS Profiling support plugin.
 *
 * @author Matias Mirabelli <admin@moyrax.com>
 */
Debugger.Profiler = Debugger.Plugins.register(Debugger.PluginType.PROFILING,
                                              null, function() {
  /**
   * @class Profile descriptor. This class keeps track of all operations in
   * a single method. A new <code>Profile</code> instance will be created
   * for each method.
   *
   * Note: In the current version there's no concurrency control, so Profiler
   * may have inconsistency in cases on the same Wrapper is used with
   * different objects and Ajax requests are made by these objects
   * using as callback a method registered in the Profiler previously.
   *
   * @param theMethodName {String} Name of the method.
   *
   * @author Matías Mirabelli <admin@moyrax.com>
   * @since 0.11
   */
  var Profile = function(theMethodName) {
    var lastTimeRef = null;
    var execCount = 0;
    var totalTime = 0;
    var minTime = 1000000;
    var maxTime = 0;
    var entries = [];
    var lastEntry = null;

    var publicInterface = {
      /**
       * Method name.
       */
      methodName : theMethodName,

      /**
       * Method execution starts.
       */
      start : function () {
        lastTimeRef = new Date().getTime();
        lastEntry = new Profile.Entry(this.methodName, lastTimeRef);
        execCount++;
      },

      /**
       * Method execution ends.
       */
      finalize : function() {
        lastEntry.endTime = new Date().getTime();
        lastEntry.totalTime = lastEntry.endTime - lastEntry.startTime;
        totalTime += (lastEntry.endTime - lastEntry.startTime);

        if (lastEntry.totalTime > maxTime) {
          maxTime = lastEntry.totalTime;
        }

        if (lastEntry.totalTime < minTime) {
          minTime = lastEntry.totalTime;
        }

        entries.push(lastEntry);
      },

      /**
       * Returns the total time, in milliseconds, that the method related to
       * this profile has been executing.
       */
      getTotalTime : function() {
        return totalTime;
      },

      /**
       * Returns how many times this method has been called.
       */
      getExecutionCount : function() {
        return execCount;
      }
    };
    return publicInterface;
  };

  /**
   * @class Entry related to a profile. Each entry represents
   * a call to a method.
   *
   * @param theMethodName {String} Name of the method.
   *
   * @author Matías Mirabelli <admin@moyrax.com>
   * @since 0.11
   */
  Profile.Entry = function(theMethodName, startTime) {
    var publicInterface = {
      methodName : theMethodName,

      startTime : startTime || (new Date().getTime()),

      endTime : 0,

      totalTime : 0
    };
    return publicInterface;
  };

  /**
   * Profile list.
   *
   * @type Array[Profile]
   */
  var _profiles = [];

  /* Visible interface. */
  var publicInterface = {
    /**
     * Pushs a method into the stack.
     *
     * @param theData {Object} Debugging data for this event.
     */
    push : function(theData) {},

    /**
     * Removes the last method from the stack.
     *
     * @param theData {Object} Debugging data for this event.
     */
    pop : function(theData) {},

    /**
     * Called before the wrapper executes the original method.
     *
     * @param theData {Object} Data passed by the wrapper.
     */
    prolog : function (theData) {
      if (!_profiles[theData.name]) {
        _profiles[theData.name] = new Profile(theData.name);
      }

      _profiles[theData.name].start();
    },

    /**
     * Called after the wrapper executes the original method.
     *
     * @param theData {Object} Data passed by the wrapper.
     */
    epilog : function (theData) {
      if (!_profiles[theData.name]) {
        Debugger.raiseError("Profiler couldn't find the method descriptor.");
      }

      _profiles[theData.name].finalize();
    },

    /**
     * Returns a Profile related to the specified method name.
     *
     * @param aMethodName {String} Method name.
     */
    getProfile : function(aMethodName) {
      return _profiles[aMethodName] || null;
    }
  };

  return publicInterface;
}());
/**
 * Debug-JS Prototype Adapter Plugin.
 *
 * This plugin allows to wrap a set of Prototype framework classes, in order to
 * attach the debugger to all classes in a transparent way, without putting any
 * code inside the application.
 *
 * @author Matias Mirabelli <admin@moyrax.com>
 */
Debugger.Adapter.Prototype = function () {
  /* Default Context for this object */
  var context = new Debugger.Context();

  /**
   * Overrides the constructor of a class.
   *
   * @param aFunction {Function} Class definition.
   */
  var _constructorProxy = function(aFunction) {
    if (!aFunction.prototype) {
      return aFunction;
    }

    var constructor = aFunction.prototype.initialize;

    /* Checks for a Prototype-compatible class */
    if (!constructor) {
      return aFunction;
    }

    /* Wraps the class constructor */
    aFunction.prototype.initialize = Debugger.Utils.wrap(constructor,
                                                         function($super) {
      var _arguments = [];

      for (var i = 1, j = arguments.length; i < j; i++) {
        _arguments.push(arguments[i]);
      }

      /* Attachs the debugger, if it's not attached yet. */
      if (!Debugger.isDebugging(this)) {
        Debugger.attach(this, context);
      }

      /* Executes the original constructor */
      $super.apply(this, _arguments);
    });

    return aFunction;
  };

  /**
   * Attachs PFA to all classes in the given container that matches
   * the specified regexp filter.
   *
   * @param aContainer {Object} Container object.
   * @param nameRegexp {RegExp} Class name filter.
   */
  var _initAdapter = function (aContainer, nameRegexp) {
    for (var property in aContainer) {
      if (aContainer.hasOwnProperty(property)) {
        if (typeof aContainer[property] == "object") {
          _initAdapter(aContainer[property], nameRegexp);
        }

        if (!nameRegexp) {
          nameRegexp = /.*/;
        }

        if (typeof aContainer[property] == "function" &&
            nameRegexp.test(property)) {
          aContainer[property] = _constructorProxy(aContainer[property]);
        }
      }
    }
  };

  var publicInterface = {
    /**
     * Attachs PFA to all classes in the given container that matches
     * the specified regexp filter. If no filter is specified, this
     * method will act in all classes.
     *
     * @param aContainer {Object} Container object.
     * @param nameRegexp {RegExp} Class name filter.
     */
    setup : function(aContainer, nameRegexp) {
      /* Forces the attachment in a specific class */
      if (typeof aContainer == "function") {
        aContainer = _constructorProxy(aContainer);
      } else {
      /* Attach PFA to all clases in the container */
        _initAdapter(aContainer, nameRegexp);
      }
    },

    /**
     * Adds a new exception handler to the adapter.
     *
     * @param eventHandler {Function} Exception handler callback.
     */
    addErrorHandler : function(eventHandler) {
      context.addHandler(Debugger.Events.ERROR, eventHandler);
    }
  };

  return publicInterface;
}();
