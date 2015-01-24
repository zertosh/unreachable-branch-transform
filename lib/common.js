/**
 * Shim "lib/common.js" so "lib/evaluator.js" can work wothout modification.
 *
 * https://github.com/Constellation/esmangle/blob/7e4ee597/lib/common.js
 * https://github.com/Constellation/esmangle/blob/7e4ee597/lib/evaluator.js
 */

var recast = require('recast');
var Syntax = {};

Object.keys(recast.types.namedTypes).forEach(function(namedType) {
  Syntax[namedType] = namedType;
});

module.exports = {
  Array: {
    last: function(array) { return array[array.length - 1]; }
  },
  Syntax: Syntax,
  unreachable: function() {
    throw new Error('Unreachable point. logically broken.');
  }
};
