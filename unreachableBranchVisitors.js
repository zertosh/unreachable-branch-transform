var Syntax = require('./lib/common').Syntax;
var booleanCondition = require('./lib/evaluator').booleanCondition;
var isConstant = require('./lib/evaluator').constant.isConstant;
var utils = require('jstransform/src/utils');

/**
 *  `||` and `&&`
 */
function logicalExpressionVisitor(traverse, node, path, state) {
  var left = booleanCondition(node.left);
  if (typeof left !== 'boolean') {
    return;
  }
  if (left === true && node.operator === '||' ||
      left === false && node.operator === '&&') {
    if (!isConstant(node.right)) {
      // Don't add noise by commenting out constants
      commentOutNode(null, node.right, state);
    }
    return false;
  }
}
logicalExpressionVisitor.test = function(node/*, path, state*/) {
  return (node.type === Syntax.LogicalExpression);
};

/**
 *  `if` and ternary `?`
 */
function conditionVisitor(traverse, node, path, state) {
  var parent = path[0];
  var test = booleanCondition(parent.test);
  if (typeof test !== 'boolean') {
    return;
  }
  if (test === true && parent.alternate === node ||
      test === false && parent.consequent === node) {
    if (!isConstant(node)) {
      // Don't add noise by commenting out constants
      commentOutNode(null, node, state);
    }
    return false;
  }
}
conditionVisitor.test = function(node, path/*, state*/) {
  // Visit the _branch_ and not the _test_ because the _test_ might have
  // branches of its own to visit.
  var parent = path[0];
  // Only `IfStatement` and `ConditionalExpression` have "consequent" and "alternate"
  return parent && (parent.consequent === node || parent.alternate === node);
};


exports.visitorList = [
  logicalExpressionVisitor,
  conditionVisitor
];


/**
 * Helpers
 */

function commentOutNode(value, node, state) {
  if (node.type === Syntax.BlockStatement) {
    // Keep existing curly braces
    wrapRange('/*', '*/', node.range[0] + 1, node.range[1] - 1, state);
  } else {
    wrapRange(value + ' /*', '*/', node.range[0], node.range[1], state);
  }
}

function wrapRange(pre, post, start, end, state) {
  // console.log('[before] %s', state.g.buffer);
  utils.catchup(start, state);
  utils.append(pre, state);
  utils.catchup(end, state);
  utils.append(post, state);
  // console.log(' [after] %s \n', state.g.buffer);
}

// function nodeSource(node, state) {
//   return state.g.source.slice(node.range[0], node.range[1]);
// }
