var booleanCondition = require('./lib/evaluator').booleanCondition;

var recast = require('recast');
var types = recast.types;
var b = types.builders;

module.exports = removeUnreachable;

function removeUnreachable(branch) {
  recast.visit(branch, {
    visitLogicalExpression: visitLogicalExp,
    visitIfStatement: visitCondition,
    visitConditionalExpression: visitCondition
  });
  return branch;
}


/**
 *  "||" and "&&"
 */
function visitLogicalExp(path) {
  var leftEval = booleanCondition(path.node.left);

  if (typeof leftEval !== 'boolean') {
    // console.log('___ %s ___', path.node.operator);
    this.traverse(path);
    return;
  }

  if (leftEval === true && path.node.operator === '||') {
    // console.log('true || ___');
    path.replace(b.literal(true));
    removeUnreachable(path);
    return false;
  }

  if (leftEval === true && path.node.operator === '&&') {
    // console.log('true && ___');
    path.replace(path.node.right);
    removeUnreachable(path);
    return false;
  }

  if (leftEval === false && path.node.operator === '&&') {
    // console.log('false && ___');
    path.replace(b.literal(false));
    removeUnreachable(path);
    return false;
  }

  if (leftEval === false && path.node.operator === '||') {
    // console.log('false || ___');
    path.replace(path.node.right);
    removeUnreachable(path);
    return false;
  }
}

/**
 *  "if" and ternary "?"
 */
function visitCondition(path) {
  var testEval = booleanCondition(path.node.test);

  if (typeof testEval !== 'boolean') {
    // console.log('if/? ___');
    this.traverse(path);
    return;
  }

  if (testEval === true) {
    // console.log('if/? (true)');
    path.replace(path.value.consequent);
    removeUnreachable(path);
    return false;
  }

  if (testEval === false) {
    // console.log('if/? (false)');
    path.replace(path.value.alternate);
    removeUnreachable(path);
    return false;
  }
}
