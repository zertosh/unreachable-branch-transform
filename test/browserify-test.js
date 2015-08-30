var browserify = require('browserify');
var test = require('tap').test;
var ubt = require('../');
var vm = require('vm');

test('browserify', function (t) {
  t.plan(2);

  var b = browserify();

  b.require(__dirname + '/bundle/index.js');
  b.transform(ubt);

  b.bundle(function (err, src) {
    t.error(err);
    t.notMatch(/unreachable/, src);

    var c = {
      console: {
        log: function(msg) {
          t.equal(msg, 'reachable');
        }
      }
    };

    vm.runInNewContext(src, c);
  });
});

test('browserify with configure', function (t) {
  t.plan(2);

  var b = browserify();

  b.require(__dirname + '/bundle/index.js');
  b.transform(ubt.configure());

  b.bundle(function (err, src) {
    t.error(err);
    t.notMatch(/unreachable/, src);

    var c = {
      console: {
        log: function(msg) {
          t.equal(msg, 'reachable');
        }
      }
    };

    vm.runInNewContext(src, c);
  });
});
