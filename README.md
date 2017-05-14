--Instructions on how to launch BookFace server--


1. Install Node.js and MongoDB.
------------------------------------------------------------

	(For Windows users)
2. Using the command prompt navigate to the downloaded BF file and type in:

npm install

This will install all the dependencies needed to run the server.

------------------------------------------------------------

3. In a different command prompt launch MongoDB by typing:

mongod

Leave the prompt running in the background and go back to the first command prompt.
------------------------------------------------------------

4. After the dependencies installation finishes type in:

nodemon app/app.js

This will launch the server at http://localhost:3000.

The server can be accessed by navigating to http://localhost:3000 through a browser.

