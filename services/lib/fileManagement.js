var mkdirp = require('mkdirp'),
fs = require('fs'),
dir = __dirname;

exports = module.exports = {
  createGuid: function() {
    // Creates a string that looks mostly like a GUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },
  readFile: function(guid, userId, callback) {
    // Reads the file off of the hard drive
    fs.readFile(dir + '/../files/' + userId + '/'  + guid + '.json', 'utf8', function (err,data) {
      if (err) {
        callback(err);
      } else {
        callback (null, data);
      }
    });
  },
  returnFile: function(req, res) {
    // Returns the contents of the file that it reads
    exports.readFile(req.params.guid, req.params.userId, function (err,data) {
      if (err) {
        res.status(404);
        res.send('error', { error: err });
      } else {
        res.send(data);
      }
    });
  },
  writeFile: function(fileContents, callback) {
    // Writes the file you specified to the hard drive
    var thisFileContents = {
      userId: fileContents.userId || 0,
      guid: fileContents.guid || exports.createGuid(),
      mapName: fileContents.mapName,
      userJson: fileContents.userJson,
      isPublic: fileContents.isPublic,
      isShared: fileContents.isShared
    };
    mkdirp(dir + '/../files/' + thisFileContents.userId, function (dirErr) {
      if (dirErr) {
        callback();
      } else {
        fs.writeFile(dir + '/../files/' + thisFileContents.userId + '/' + thisFileContents.guid + '.json', JSON.stringify(thisFileContents, null, 2), function(err) {
          if(err) {
            callback();
          } else {
            callback(thisFileContents);
          }
        });
      }
    });
  },
  deleteFile: function (guid, userId, callback) {
    fs.unlink(dir + '/../files/' + userId + '/'  + guid + '.json', function (err,data) {
      callback(err, data);
    });
  },
  readReq: function(req, callback) {
    // When you put or post a file, you need to read the stream in to the app
    // This function takes care of that
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
  }
};
