if (typeof define !== 'function') { 
	var define = require('amdefine')(module)
}
define(function(require) {
var WaveSurfer = require('wavesurfer')
/* Common utilities */
WaveSurfer.util = {
    extend: function (dest) {
        var sources = Array.prototype.slice.call(arguments, 1);
        sources.forEach(function (source) {
            Object.keys(source).forEach(function (key) {
                dest[key] = source[key];
            });
        });
        return dest;
    },

    getId: function () {
        return 'wavesurfer_' + Math.random().toString(32).substring(2);
    },

    max: function (values, min) {
        var max = -Infinity;
        for (var i = 0, len = values.length; i < len; i++) {
            var val = values[i];
            if (min != null) {
                val = Math.abs(val - min);
            }
            if (val > max) { max = val; }
        }
        return max;
    },

    ajax: function (options) {
        var ajax = Object.create(WaveSurfer.Observer);
        var xhr = new XMLHttpRequest();
        var fired100 = false;

        xhr.open(options.method || 'GET', options.url, true);
        xhr.responseType = options.responseType || 'json';

        xhr.addEventListener('progress', function (e) {
            ajax.fireEvent('progress', e);
            if (e.lengthComputable && e.loaded == e.total) {
                fired100 = true;
            }
        });

        xhr.addEventListener('load', function (e) {
            if (!fired100) {
                ajax.fireEvent('progress', e);
            }
            ajax.fireEvent('load', e);

            if (200 == xhr.status || 206 == xhr.status) {
                ajax.fireEvent('success', xhr.response, e);
            } else {
                ajax.fireEvent('error', e);
            }
        });

        xhr.addEventListener('error', function (e) {
            ajax.fireEvent('error', e);
        });

        xhr.send();
        ajax.xhr = xhr;
        return ajax;
    }
};


/* Observer */
WaveSurfer.Observer = {
    /**
     * Attach a handler function for an event.
     */
    on: function (event, fn) {
        if (!this.handlers) { this.handlers = {}; }

        var handlers = this.handlers[event];
        if (!handlers) {
            handlers = this.handlers[event] = [];
        }
        handlers.push(fn);
    },

    /**
     * Remove an event handler.
     */
    un: function (event, fn) {
        if (!this.handlers) { return; }

        var handlers = this.handlers[event];
        if (handlers) {
            if (fn) {
                for (var i = handlers.length - 1; i >= 0; i--) {
                    if (handlers[i] == fn) {
                        handlers.splice(i, 1);
                    }
                }
            } else {
                handlers.length = 0;
            }
        }
    },

    /**
     * Remove all event handlers.
     */
    unAll: function () {
        this.handlers = null;
    },

    /**
     * Attach a handler to an event. The handler is executed at most once per
     * event type.
     */
    once: function (event, handler) {
        var my = this;
        var fn = function () {
            handler.apply(this, arguments);
            setTimeout(function () {
                my.un(event, fn);
            }, 0);
        };
        this.on(event, fn);
    },

    fireEvent: function (event) {
        if (!this.handlers) { return; }
        var handlers = this.handlers[event];
        var args = Array.prototype.slice.call(arguments, 1);
        handlers && handlers.forEach(function (fn) {
            fn.apply(null, args);
        });
    }
};


/* Make the main WaveSurfer object an observer */
WaveSurfer.util.extend(WaveSurfer, WaveSurfer.Observer);

});