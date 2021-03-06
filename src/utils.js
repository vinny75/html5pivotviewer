//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2016 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//
PivotViewer.Utils.EscapeMetaChars = function(jQuerySelector) {
    //!"#$%&'()*+,./:;<=>?@[\]^`{|}~
    return jQuerySelector
        .replace(/\|/gi, "\\|")
        .replace(/\//gi, "\\/")
        .replace(/'/gi, "\\'")
        .replace(/,/gi, "\\,")
        .replace(/:/gi, "\\:")
        .replace(/\(/gi, "\\(")
        .replace(/\)/gi, "\\)")
        .replace(/\+/gi, "\\+")
        .replace(/\+/gi, "\\-")
        .replace(/\+/gi, "\\_")
        .replace(/\+/gi, "\\%");
};

PivotViewer.Utils.EscapeItemId = function(itemId) {
    return itemId
        .replace(/\s+/gi, "|")
        .replace(/'/gi, "")
        .replace(/\(/gi, "")
        .replace(/\)/gi, "")
        .replace(/\./gi, "");
};

PivotViewer.Utils.HtmlSpecialChars = function(orig) {
    return jQuery('<div />').text(orig).html();
}

PivotViewer.Utils.Histogram = function(values) {
    if (!(values instanceof Array)) {
        return null;
    }

    var min = values[0],
		max = values[0];
	var x;
	for (var i = 1, n = values.length; i < n; ++i) {
		x = values[i];
		if (x < min) {
			min = x;
		}
		if (x > max) {
			max = x;
		}
	}		

    var bins = (Math.floor(Math.pow(2 * values.length, 1 / 3)) + 1) * 2;
    if (bins > 10) {
        bins = 10;
    }
    var stepSize = ((max + 1) - (min - 1)) / bins;

    var histogram = [];
    var maxCount = 0;
    for (var i = 0; i < bins; i++) {
        var minRange = min + (i * stepSize);
        var maxRange = min + ((i + 1) * stepSize);
        histogram.push([]);
        for (var j = 0, _jLen = values.length; j < _jLen; j++) {
            if (minRange <= values[j] && maxRange > values[j]) {
                histogram[i].push(values[j]);
            }
        }
        maxCount = maxCount < histogram[i].length ? histogram[i].length : maxCount;
    }
    return {
        Histogram: histogram,
        Min: min,
        Max: max,
        BinCount: bins,
        MaxCount: maxCount
    };
};

PivotViewer.Utils.ModalDialog = function(msg, title) {
    $('<div id="pv-modal-dialog"></div>').dialog({
        modal: true,
        title: title ? title : 'HTML 5 PivotViewer',
        open: function() {
            $(this).html(msg);
        },
        buttons: {
            Ok: function() {
                $(this).dialog("close");
                $("#pv-modal-dialog").remove();
            }
        }
    }); //end confirm dialog
};

PivotViewer.Utils.AjaxErrorModalDialog = function(jqXHR, status, error, url, description) {
	var msg = description + '<br><br>';
	msg += 'URL        : ' + url + '<br>';
	msg += 'Status : ' + jqXHR.status + ' ' + error + '<br>';
	msg += 'Details    : ' + jqXHR.responseText + '<br>';
	msg += '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
	return PivotViewer.Utils.ModalDialog(msg);
};

// A simple class creation library.
// From Secrets of the JavaScript Ninja
// Inspired by base2 and Prototype
(function() {
    var initializing = false,
        // Determine if functions can be serialized
        fnTest = /xyz/.test(function() {
            xyz;
        }) ? /\b_super\b/ : /.*/;

    // Create a new Class that inherits from this class
    Object.subClass = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var proto = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            proto[name] = typeof prop[name] === "function" &&
                typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = proto;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extendable
        Class.subClass = arguments.callee;

        return Class;
    };
})();