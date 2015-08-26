var booleanCondition = require('esmangle-evaluator').booleanCondition;

var recast = require('recast');
var types = recast.types;
var b = types.builders;

var VISITOR_METHODS = {
  visitLogicalExpression: visitLogicalExp,
  visitIfStatement: visitCondition,
  visitConditionalExpression: visitCondition
};

module.exports = function(branch) {
  recast.visit(branch, VISITOR_METHODS);
  return branch;
};

/**
 *  "||" and "&&"
 */
function visitLogicalExp(path) {
  var leftEval = booleanCondition(this.visit(path.get('left')));

  if (typeof leftEval === 'boolean') {
    path.replace(
      leftEval === (path.node.operator === '&&')
        ? this.visit(path.get('right'))
        : b.literal(leftEval)
    );
  } else {
    this.visit(path.get('right'));
  }
}

/**
 *  "if" and ternary "?"
 */
function visitCondition(path) {
  var testEval = booleanCondition(this.visit(path.get('test')));

  var replacement;
  if (testEval !== false) {
    replacement = this.visit(path.get('consequent'));
  }

  if (testEval !== true) {
    replacement = this.visit(path.get('alternate'));
  }

  if (typeof testEval === 'boolean') {
    path.replace(replacement);
  }
}
