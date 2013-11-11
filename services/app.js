var express = require('express'),
allowXSS = require('./allowXSS'),
fs = require('fs'),

// Set the environment variables
app = express(),
dir = __dirname,
createGuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
},
readFile = function(guid, callback) {
  fs.readFile(dir + '/' + guid + '.json', 'utf8', function (err,data) {
    if (err) {
      callback(err);
    } else {
      callback (null, data);
    }
  });
},
returnFile = function(req, res) {
  readFile(req.params.guid, function (err,data) {
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
    userId: fileContents.userId,
    guid: fileContents.guid || createGuid(),
    mapName: fileContents.mapName,
    userJson: fileContents.userJson,
    isPublic: fileContents.isPublic,
    isShared: fileContents.isShared
  };
  fs.writeFile(dir + '/' + thisFileContents.guid, thisFileContents, function(err) {
    if(err) {
      callback();
    } else {
      callback(thisFileContents);
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

app.set('port', process.env.PORT || 3001);
allowXSS(app);

app.get('/builder/:userId/:guid', function(req, res) {
  // Just returns the whole file to the user
  returnFile(req, res);
});

app.post('/builder/:userId', function(req, res) {
  readReq(req, function(fileContents) {
    writeFile(fileContents, function(file) {
      if (file && file.guid) {
        res.send(file.guid);
      } else {
        res.status('500');
        res.send('error', { error:  'No more information'});
      }
    });
  });
});

app.put('/builder/:userId/:guid', function (req, res) {
  readReq(req, function(fileContents) {
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

app.delete('/builder/:userId/:guid', function (req, res) {
  //TODO: delete the file and if it doesn't exist, return 404
  res.send(req.params.guid);
});

app.listen(app.get('port'));
console.log('Node.js server listening on port ' + app.get('port'));
