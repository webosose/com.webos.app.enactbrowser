const
    express = require("express"),
    basicAuth = require("basic-auth-connect"),
    app = express();
    app.disable('x-powered-by');
app.use(basicAuth("foo", "bar"), express.static("static"));

app.listen(3001);
console.log('Server is listening on 3001 port');
