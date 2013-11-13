var express = require('express'),
allowXSS = require('./allowXSS'),
mkdirp = require('mkdirp'),
fs = require('fs'),

// Set the environment variables
app = express(),
dir = __dirname,
// Required Functions
createGuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
},
readFile = function(guid, userId, callback) {
  fs.readFile(dir + '/files/' + userId + '/'  + guid + '.json', 'utf8', function (err,data) {
    if (err) {
      callback(err);
    } else {
      callback (null, data);
    }
  });
},
returnFile = function(req, res) {
  readFile(req.params.guid, req.params.userId, function (err,data) {
    if (err) {
      res.status(404);
      res.send('error', { error: err });
    } else {
      res.send(data);
    }
  });
},
writeFile = function(fileContents, callback) {
  var thisFileContents = {
    userId: fileContents.userId || 0,
    guid: fileContents.guid || createGuid(),
    mapName: fileContents.mapName,
    userJson: fileContents.userJson,
    isPublic: fileContents.isPublic,
    isShared: fileContents.isShared
  };
  mkdirp(dir + '/files/' + thisFileContents.userId, function (dirErr) {
    if (dirErr) {
      callback();
    } else {
      fs.writeFile(dir + '/files/' + thisFileContents.userId + '/' + thisFileContents.guid + '.json', JSON.stringify(thisFileContents, null, 2), function(err) {
        if(err) {
          callback();
        } else {
          callback(thisFileContents);
        }
      });
    }
  });
},
readReq = function(req, callback) {
  var reqData = '',
  calledback = false;
  req.setEncoding('utf8');
  req.on('data', function(data) {
    reqData += data;
  });

  req.on('error', function(err) {
    if (!calledback) {
      callback(err, null);
      calledback = true;
    }
  });

  req.on('end', function() {
    if (!calledback) {
      callback(reqData);
      calledback = true;
    }
  });
};

// Set up the server
app.set('port', process.env.PORT || 3001);
allowXSS(app);

// Paths
app.get('/:userId/:guid', function(req, res) {
  // Just returns the whole file to the user
  returnFile(req, res);
});

app.post('/', function(req, res) {
  readReq(req, function(fileContents) {
    fileContents = JSON.parse(fileContents);
    writeFile(fileContents, function(file) {
      if (file && file.guid) {
        res.send({'guid': file.guid, 'userId' : file.userId});
      } else {
        res.status('500');
        res.send('error', { error:  'No more information'});
      }
    });
  });
});

app.put('/:userId/:guid', function (req, res) {
  readReq(req, function(fileContents) {
    fileContents = JSON.parse(fileContents);
    fileContents.guid = req.params.guid;
    writeFile(fileContents, function(file) {
      if (file) {
        res.send(file);
      } else {
        req.status('500');
        res.send('error', { error:  'No more information'});
      }
    });
  });
});

app.delete('/:userId/:guid', function (req, res) {
  //TODO: delete the file and if it doesn't exist, return 404
  res.send(req.params.guid);
});

app.use(express.static(__dirname + '/html'));

app.listen(app.get('port'));
console.log('Node.js server listening on port ' + app.get('port'));
