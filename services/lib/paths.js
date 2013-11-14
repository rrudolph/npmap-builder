var express = require('express'),
passwords = require('./passwords'),
fileManagement = require('./fileManagement'),
noauth = express.basicAuth(function(user, pass, callback) {
  callback(null /* error */, true);
}),
auth = express.basicAuth(function(user, pass, callback) {
  var result = passwords.validate(user, pass, this);
  callback(null /* error */, result);
}),
functions = {
  create: function(req, res) {
    fileManagement.readReq(req, function(fileContents) {
      fileContents = JSON.parse(fileContents);
      fileManagement.writeFile(fileContents, function(file) {
        if (file && file.guid) {
          res.send({'guid': file.guid, 'userId' : file.userId});
        } else {
          res.status('500');
          res.send('error', { error:  'No more information'});
        }
      });
    });
  },
  read: function(req, res) {
    fileManagement.returnFile(req, res);
  },
  update: function(req, res) {
    fileManagement.readReq(req, function(fileContents) {
      fileContents = JSON.parse(fileContents);
      fileContents.guid = req.params.guid;
      fileManagement.writeFile(fileContents, function(file) {
        if (file) {
          res.send(file);
        } else {
          req.status('500');
          res.send('error', { error:  'No more information'});
        }
      });
    });
  },
  del: function(req, res) {
    //TODO: delete the file and if it doesn't exist, return 404
    res.send(req.params.guid);
  }
},
paths = [{
  'method': 'post',
  'path': '/',
  'auth': auth,
  'process': functions.create
},{
  'method': 'get',
  'path': '/:userId/:guid',
  'auth': noauth,
  'process': functions.read
},{
  'method': 'put',
  'path': '/:userId/:guid',
  'auth': auth,
  'process': functions.update
},{
  'method': 'delete',
  'path': '/:userId/:guid',
  'auth': auth,
  'process': functions.del
}];


exports = module.exports = function(mode) {
  var app = express();

  if (mode === 'test') {
    // Display the HTML
    app.use('/', express.static(__dirname + '/../html'));
  }

  // Add the paths
  paths.map(function(path) {
    app[path.method.toLowerCase()](path.path, path.auth, path.process);
  });

  return app;
};

