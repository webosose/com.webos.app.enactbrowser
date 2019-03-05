This server is used for verification of 'Basic authentication' feature
of the enact browser. With this server we can test, that authentication dialog
appears in browser when accessing to server and that the browser saves
authentication credentials for resources, which are loaded along with index.html

## Running the server
First install node.js and npm on your PC:
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm

The server runs on node + express.

To run the server:
1. run `npm install` for the first run
2. then `npm start`. Server will start on port 3001.

## Testing basic authentication
1. Run browser and navigate to http://[ip_of_the_server]:3001
2. Authentication dialog should appear
3. Enter credentials username - 'foo', password - 'bar'
4. Press ok
5. Page should be loaded
6. If CSS is loaded, then you can see color rectangle with text
   "style.css is loaded"
7. Also, there will be another text - "This text should be replaced with JS in
   two seconds!" and it will be replaced to "script.js is loaded successfully!",
   if script.js is loaded



