var through = require('through2');
var path = require('path');
var jstransform = require('jstransform').transform;

var reJSONFile = /\.json$/;

var visitorList = require('./unreachableBranchVisitors').visitorList;

function process(file, opts) {
  // pass exts to whitelist a set of extensions to process.
  var exts = [].concat(opts.exts || []).map(function(ext) {
      // Make sure all extensions start with a . because path.extname(file)
      // includes the .
      if (ext.charAt(0) === '.') return ext
      return '.' + ext
  })

  if (reJSONFile.test(file)) return through();
  if (exts.length && exts.indexOf(path.extname(file)) === -1) return through();

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
