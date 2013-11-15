var express = require('express'),
passwords = require('./passwords'),
fileManagement = require('./fileManagement'),
noauth = express.basicAuth(function(user, pass, callback) {
  callback(null /* error */, true);
}),
auth = express.basicAuth(function(user, pass, callback) {
  var result = passwords.validate(user, pass);
  callback(null /* error */, result);
}),
jsonParse = function(json, callback) {
  if (json) {
    try {
      var jsoned = JSON.parse(json);
      callback(null, jsoned);
    } catch(e) {
      callback (e);
    }
  } else {
    callback({'error': 'invalid json'});
  }
},
functions = {
  create: function(req, res) {
    fileManagement.readReq(req, function(fileContents) {
      jsonParse(fileContents, function(err, data) {
        if (!err) {
          fileManagement.writeFile(data, function(file) {
            if (file && file.guid) {
              res.send({'guid': file.guid, 'userId' : file.userId});
            } else {
              err = { 'error': 'Write Error' };
            }
          });
        }
        if (err) {
          if (err.message) {err = err.message;}
          res.send(400, {'error': err} );
        }
      });
    });
  },
  read: function(req, res) {
    fileManagement.returnFile(req, res);
  },
  update: function(req, res) {
    fileManagement.readReq(req, function(fileContents) {
      jsonParse(fileContents, function(err, data) {
        if (!err) {
          data.guid = req.params.guid;
          fileManagement.writeFile(data, function(file) {
            if (file) {
              res.send(file);
            } else {
              err = { 'error' : 'Write Error' };
            }
          });
        }
        if (err) {
          if (err.message) {err = err.message;}
          res.send('400', { 'error':  err});
        }
      });
    });
  },
  del: function(req, res) {
    //TODO: delete the file and if it doesn't exist, return 404
    fileManagement.deleteFile(req.params.guid, req.params.userId, function(err, data) {
      if (!err && data === undefined) {
        res.send(req.params.guid);
      } else {
        res.send('400', { 'error':  err});
      }
    });
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

