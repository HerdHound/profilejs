/*
 * Profilejs
 * Express V8 profiler middleware
 * 
 * Copyright (c)2011, by Branko Vukelic <branko@herdhound.com>.
 * Some rights reserved. 
 * Licensed under MIT license.
 * 
 */

var VERSION='0.0.4';

var Profile;
var Profiler;
var profile = exports;

// Profiler object with binds to v8-profiler and performs the actual profiling
//
// @api private
var profiler = {
  silent: true,
  profiler: null,
  startProfiling: function(name) {
    if (this.profiler) {
      if (!this.silent) { console.log('PROF_START: ' + name); }
      this.profiler.startProfiling(name);
    }
  },
  stopProfiling: function(name, duration) {
    if (this.profiler) {
      this.profiler.stopProfiling(name);
      if (!this.silent) {
        console.log('PROF_STOP: ' + name + 
                    ' (time: ' + duration + 'ms)');
      }
    }
  }
};

// Switch to dummy profiler
//
// Replaces the V8 profiler with dummy profiler which does nothing.
//
// @api public
profile.stop = function() {
  console.log('Switching to dummy profiler');
  profiler.silent = true;
  profiler.profiler = null;
};

// Load the real profiler
//
// Load the real V8 profiler to do actual profiling.
//
// @param silent, run in silent mode (do not log to STDOUT)
// @api public
profile.start = function(silent) {
  console.log('Loading real V8 profiler');
  profiler.silent = silent === false ? false : true;
  profiler.profiler = require('v8-profiler');
};

// Single profile object, used to record a profile of specified name
//
// The profile object has start and stop methods which start and stop the CPU
// profiling. Constructor takes a single argument, ``name``, which is used to
// identify individual profiles.
//
// @param name, profile name
// @api public
profile.Profile = Profile = function(name) {
  if (name) {
    this.enabled = true;
  } else {
    this.enabled = false;
  }
  this.name = name;
  this.profile = null;
};

// Start CPU profiling
//
// @api public
Profile.prototype.start = function() {
  if (this.enabled) {
    this.startTime = Date.now();
    profiler.startProfiling(this.name);
  }
};

// End CPU profiling
//
// @api public
Profile.prototype.stop = function() {
  if (this.enabled) {
    this.stopTime = Date.now();
    this.duration = this.stopTime - this.startTime;
    this.profile = profiler.stopProfiling(this.name, this.duration);
  }
};

// Profiler middleware
//
// The profiler middleware will profile every request. As soon as the 
// middleware callback is invoked, it starts the profiler, and ends it
// when the response finish event is triggered.
//
// The name of each profile name corresponds to the URL that profiled handler
// handled. This includes URL parameters, but not POST request parameters.
//
// To use the middleware, simply add it to the stack:
//
//     app.use(require('profile').profiler);
//
// Keep in mind that the profiler starts in dummy mode by default. You should
// enabled it by calling:
//
//     require('profile').start();
//
// It is best to define a separate environment for profiling as running with
// profiling enabled can be slow.
//
//     app.configure('profiling', function(){
//       require('profile').start();
//     });
//
// @param req, request object
// @param res, response object
// @param next, callback function invoked after profiler is started
profile.profiler = function(req, res, next) {
  var profileName = req.url;
  var profiler = new Profile(profileName);

  res.on('finish', function() {
    profiler.stop();
  });

  // Start the profiler
  profiler.start();

  next();
};
