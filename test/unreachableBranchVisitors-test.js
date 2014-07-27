var assert = require('assert');

describe('unreachableBranchVisitors', function() {

  var transformFn = require('jstransform').transform;
  var visitors = require('../unreachableBranchVisitors').visitorList;

  function transform(code) {
    return transformFn(visitors, code).code;
  }

  function expectTransform(code, result) {
    assert.equal(transform(code), (result));
  }

  describe('ConditionalExpression', function() {

    it('should do nothing', function() {
      // True ? Reachable_Constant : Unreachable_Constant
      expectTransform(
        'var a = true ? true : true;',
        'var a = true ? true : true;'
      );
      // False ? Unreachable_Constant : Reachable_Constant
      expectTransform(
        'var a = false ? true : true;',
        'var a = false ? true : true;'
      );
      // True ? Reachable_Indeterminate : Unreachable_Constant
      expectTransform(
        'var a = true ? console.log() : true;',
        'var a = true ? console.log() : true;'
      );
    });

    it('should comment out the alternate with boolean test', function() {
      // True ? Reachable_Constant : Unreachable_Indeterminate
      expectTransform(
        'var a = true ? true : console.log();',
        'var a = true ? true : null /*console.log()*/;'
      );
      // True ? Reachable_Indeterminate : Unreachable_Indeterminate
      expectTransform(
        'var a = true ? console.log() : console.log();',
        'var a = true ? console.log() : null /*console.log()*/;'
      );
    });

    it('should comment out the alternate with string cast test', function() {
      // True ? Reachable_Constant : Unreachable_Indeterminate
      expectTransform(
        'var a = "true" ? true : console.log();',
        'var a = "true" ? true : null /*console.log()*/;'
      );
      // True ? Reachable_Indeterminate : Unreachable_Indeterminate
      expectTransform(
        'var a = "true" ? console.log() : console.log();',
        'var a = "true" ? console.log() : null /*console.log()*/;'
      );
    });

    it('should comment out the consequent with string cast test', function() {
      // True ? Reachable_Constant : Unreachable_Indeterminate
      expectTransform(
        'var a = "" ? console.log() : true;',
        'var a = "" ? null /*console.log()*/ : true;'
      );
      // True ? Reachable_Indeterminate : Unreachable_Indeterminate
      expectTransform(
        'var a = "" ? console.log() : console.log();',
        'var a = "" ? null /*console.log()*/ : console.log();'
      );
    });

  });

  describe('IfStatement', function() {

    it('should Comment alternate BlockStatement body', function() {
      expectTransform(
        'if (true) { console.log(); } else { console.log(); }',
        'if (true) { console.log(); } else {/* console.log(); */}'
      );
    });

    it('should Comment consequent BlockStatement body', function() {
      expectTransform(
        'if (false) { console.log(); } else { console.log(); }',
        'if (false) {/* console.log(); */} else { console.log(); }'
      );
    });

    it('should Comment alternate IfStatement body', function() {
      expectTransform([
        'if (true) {',
        '  console.log();',
        '} else if (true) {',
        '  console.log();',
        '} else {',
        '  console.log();',
        '}'
      ].join('\n'), [
        'if (true) {',
        '  console.log();',
        '} else null /*if (true) {',
        '  console.log();',
        '} else {',
        '  console.log();',
        '}*/'
      ].join('\n'));
    });

    it('should Comment consequent BlockStatement body and alternate IfStatement alternate', function() {
      expectTransform([
        'if (false) {',
        '  console.log();',
        '} else if (true) {',
        '  console.log();',
        '} else {',
        '  console.log();',
        '}'
      ].join('\n'), [
        'if (false) {/*',
        '  console.log();',
        '*/} else if (true) {',
        '  console.log();',
        '} else {/*',
        '  console.log();',
        '*/}'
      ].join('\n'));
    });

  });

  describe('LogicalExpression', function() {
    it('should do nothing', function() {
      expectTransform(
        'true || true;',
        'true || true;'
      );
      expectTransform(
        'false || console.log();',
        'false || console.log();'
      );
      expectTransform(
        'true && console.log();',
        'true && console.log();'
      );
    });

    it('should Comment right', function() {
      expectTransform(
        'true || console.log();',
        'true || null /*console.log()*/;'
      );
      expectTransform(
        'false && console.log();',
        'false && null /*console.log()*/;'
      );
    });
  });

});
