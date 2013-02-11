mserver
=======

mserver is a web application backend framework for Node.

* Very simple to use, requires minimal setup.
* Supports pages, which are split into components.
* Uses mcomponent template engine to render components.
* Supports JSON endpoints.
* Supports WebSocket endpoints.

State
=====

mserver is starting to look pretty nice, but it is not yet ready for prime time.

Fork it if you wanna check it out, but everything is in very much development state.

	./mserver/

The web framework. Check this out if you wanna know how mserver works.

	./server/

An example web application that runs in mserver on Node.
This is the application that I use to test things out, so it doesn't really look very nice :)
It requires websocket module.

To run it:

	$ cd server
	$ npm install websocket
	$ node server.js

Development
===========

I am working actively on this project, expect a release some time soon.

