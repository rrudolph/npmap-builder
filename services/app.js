var express = require('express'),
allowXSS = require('./allowXSS'),
paths = require('./lib/paths.js'),
app = express();

// Set up the server
app.set('port', process.env.PORT || 3001);
allowXSS(app);

app.use('/builder', paths('test'));

app.listen(app.get('port'));
console.log('Node.js server listening on port ' + app.get('port'));
