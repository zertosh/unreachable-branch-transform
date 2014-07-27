/**
 * Minimal rework of esmangle's `lib/common.js`, so `evaluator.js` can work
 * without modification.
 *
 * https://github.com/Constellation/esmangle/blob/7e4ee597ea665505b9299c24f1dd4935c39bb4ba/lib/common.js
 * https://github.com/Constellation/esmangle/blob/7e4ee597ea665505b9299c24f1dd4935c39bb4ba/lib/evaluator.js
 */

var common = {};

var Syntax = require('esprima-fb').Syntax;
common.Syntax = Syntax;

function arrayLast(array) {
  return array[array.length - 1];
}
common.Array = {
  last: arrayLast
};

function unreachable() {
  throw new Error('Unreachable point. logically broken.');
}
common.unreachable = unreachable;

module.exports = common;
