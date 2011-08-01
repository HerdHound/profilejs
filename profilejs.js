/*
 * Profilejs
 * Express V8 profiler middleware
 * 
 * Copyright (c)2011, by Branko Vukelic <branko@herdhound.com>.
 * Some rights reserved. 
 * Licensed under MIT license.
* 
 */

var VERSION='0.0.1';

var Profile;
var Profiler;
var dummyProfiler = {
  startProfiling: function() { return; },
  endProfiling: function() { return; }
};
var v8profiler = dummyProfiler; // disabled by default;
var silentMode = false;

var profile = exports;

// Switch to dummy profiler
//
// Replaces the V8 profiler with dummy profiler which does nothing.
//
// @param silent, run in silent mode (do not log to STDOUT)
// @api public
profile.stop = function(silent) {
  silentMode = silent;
  console.log('Switching to dummy profiler');
  v8profiler = dummyProfiler;
};

// Load the real profiler
//
// Load the real V8 profiler to do actual profiling.
//
// @param silent, run in silent mode (do not log to STDOUT)
// @api public
profile.start = function(silent) {
  silentMode = silent;
  console.log('Loading real V8 profiler');
  v8profiler = require('v8-profiler');
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
    this.profiler = v8profiler;
  } else {
    this.profiler = dummyProfiler;
  }
  this.name = name;
  this.profile = null;
};

// Start CPU profiling
//
// @api public
Profile.prototype.start = function() {
  if (!silentMode) {
    console.log('PROF_START: ' + this.name);
  }
  this.startTime = Date.now();
  this.profiler.startProfiling(this.name);
};

// End CPU profiling
//
// @api public
Profile.prototype.stop = function() {
  this.profile = this.profiler.stopProfiling(this.name);
  this.stopTime = Date.now();
  this.duration = this.stopTime - this.startTime;
  if (!silentMode) {
    console.log('PROF_STOP: ' + this.name + 
                ' (time: ' + this.duration + 'ms)');
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
