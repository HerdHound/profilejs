Profilejs: Express V8 profiler middleware
=========================================

version: 0.0.4

Copyright (c)2011, by Branko Vukelic <branko@herdhound.com>.

Some rights reserved. 

Licensed under MIT license (see
[LICENSE](https://raw.github.com/HerdHound/profilejs/master/LICENSE))

Overview
--------

Profilejs is an [Express framework](http://www.expressjs.com/) middleware 
that profiles request handlers using the 
[V8 profiler](http://github.com/dannycoates/v8-profiler) by Danny Coates.

Profilejs is most useful when used in conjunction with 
[node-inspector](http://github.com/dannycoates/node-inspector)
where you can analyze the collected information from a graphical 
in-browser interface.

Profilejs is developed and maintained by 
[foxbunny](http://github.com/foxbunny).

Status of this library
----------------------
 
This library hasn't seen any real-life use yet. It is freshly brewed and you
should keep that in mind before using. It has only been lightly tested on V8
3.2.10.2 with Node 0.4.10, and v8-profiler 0.0.3. There are no guarantees
Profilejs will run with either older or newer versions of the involved
software.

0.0.4
-----

Major change in 0.0.4 is that the dummy profiler no longer outputs anything to
console, unlike in previous versions. The internal plumbing has been reworked
to make the dummy profiler truly do nothing, so you'll no longer see any ouput
from it. 

The Profile object now has ``enabled`` property which enables or disables the
actual profi-ling. It's the same as using dummy profiler, but on a per-profile
basis.

Installation
------------

Simplest way to install Profilejs is to simply grab it from the github
repository, and put it in your source tree. Alternatively you may use npm to 
install it:

    npm install profilejs

You also need to have V8-profiler installed:

    npm install v8-profiler

Starting the profiler
---------------------

You can start the profiler using the module's ``start()`` method:

    var profilejs = require('profilejs');
    profilejs.start();

Start method takes a single boolean argument, which enables (``start(true)``) 
or disables (``start(false)``) the _silent mode_ which suppresses console
output.

To stop profiling requests, use the ``stop()`` method. The stop method doesn't
actually stop the profiler, but disables it's profiling functionality. In case
of profiler middleware, there is still a small overhead introduced by the part
of code that checks if the profiler should run. If you care about this, you
should probably remove the middleware completely.

Adding the profiler middleware
------------------------------

Before starting the profiler, you need to add the profiler middleware:

    app.use(profilejs.profiler);

Once the middleware is placed in an appropriate place in the stack, you can 
actually start it. It is best to specify a separate environment for profiling
because profiling can kill application performance.

    app.configure('profiling', function(){
      profilejs.start();
    });

After this, you can start your app with 'profiling' environment set:

    NODE_ENV=profiling node app.js

Profiling without the middleware
--------------------------------

It is possible to profile non-request code separtely without using the
middleware (or in conjunction with the middleware). Inside your library,
do this:

    var Profile = require('profilejs').Profile

    function myProfiledFunction(args) {
      var profiler = new Profile('my-function-profile');
      profiler.start();
      // Do your thing here...
      profiler.end();
    }

The above snippet will profile ``myProfiledFunction`` and create a profile with
the name of 'my-function-profile'. Keep in mind that you still have to start
the profiler, even though you don't use the middleware.
