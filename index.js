var through = require('through2');
var jstransform = require('jstransform').transform;

var reJSONFile = /\.json$/;

var visitorList = require('./unreachableBranchVisitors').visitorList;

function process(file/*, opts*/) {
  if (reJSONFile.test(file)) return through();
  var buf = '';
  return through(function(chunk, enc, cb) {
    buf += chunk;
    cb();
  }, function(cb) {
    this.push(transform(buf));
    cb();
  });
}

module.exports = process;

function transform(code/*, opts*/) {
  return jstransform(visitorList, code).code;
}

module.exports.transform = transform;

module.exports.visitorList = visitorList;
