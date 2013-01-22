webrtc-node
===========

A video chat demo app built using WebRTC backed by Node.js for signalling. 

Requirements
-------------
- Node.js 
- NPM
- [Naught.js](https://github.com/indabamusic/naught)
- Browser supporting WebRTC: Chrome 23+, Firefox

How to run?
-----------
- Clone the project and change directory to the checked out location.
- Run 'naught start --ipc-file logs/naught.ipc --log logs/naught.log --stdout logs/stdout.log --stderr logs/stderr.log app.js'
- Launch the browser and navigate to http://localhost:3300 (default dev port)

naught start --ipc-file logs/naught.ipc --log logs/naught.log --stdout logs/stdout.log --stderr logs/stderr.log app.js    

License
-------
The source code is available [here](https://github.com/varunkumar/webrtc-node) under [MIT licence](http://varunkumar.mit-license.org/). Please send any bugs, feedback, complaints, patches to me at varunkumar[dot]n[at]gmail[dot]com.

-- [Varun](http://www.varunkumar.me)

Last Modified: Tue Jan 22 21:02:36 IST 2013