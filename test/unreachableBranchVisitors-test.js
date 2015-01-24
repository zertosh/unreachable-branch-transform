var assert = require('assert');

describe('unreachable-branch-transform', function() {

  var transform = require('../').transform;

  function expectTransform(code_, result_) {
    var code = Array.isArray(code_) ? code_.join('\n') : code_;
    var result = Array.isArray(result_) ? result_.join('\n') : result_;
    return assert.equal(transform(code), result);
  }

  it('works in ExpressionStatement', function() {
    expectTransform(
      'true || true;',
      'true;'
    );

    expectTransform(
      'false || console.log();',
      'console.log();'
    );

    expectTransform(
      'true && console.log();',
      'console.log();'
    );

    expectTransform(
      'true || console.log();',
      'true;'
    );

    expectTransform(
      'false && console.log();',
      'false;'
    );
  });


  it('works in VariableDeclarator', function() {

    expectTransform(
      'var a = true ? true : true;',
      'var a = true;'
    );

    expectTransform(
      'var a = true ? true : true;',
      'var a = true;'
    );

    expectTransform(
      'var a = false ? true : true;',
      'var a = true;'
    );

    expectTransform(
      'var a = true ? console.log() : true;',
      'var a = console.log();'
    );

    expectTransform(
      'var a = true ? true : console.log();',
      'var a = true;'
    );

    expectTransform(
      'var a = true ? console.log() : console.log();',
      'var a = console.log();'
    );

    expectTransform(
      'var a = "true" ? true : console.log();',
      'var a = true;'
    );

    expectTransform(
      'var a = "true" ? console.log(1) : console.log(2);',
      'var a = console.log(1);'
    );

    expectTransform(
      'var a = "" ? console.log() : true;',
      'var a = true;'
    );

    expectTransform(
      'var a = "" ? console.log(1) : console.log(2);',
      'var a = console.log(2);'
    );

    expectTransform(
      'var a = "production" !== "development" ? console.log(3) : console.log(4);',
      'var a = console.log(3);'
    );

    expectTransform(
      'var a = "production" === "development" ? console.log(5) : console.log(6);',
      'var a = console.log(6);'
    );
  });

  it('works in IfStatement', function() {

    expectTransform(
      'if (true) { console.log(1); } else { console.log(2); }',
      '{ console.log(1); }'
    );

    expectTransform(
      'if (false) { console.log(1); } else { console.log(2); }',
      '{ console.log(2); }'
    );

    expectTransform([
      'if (true) {',
      '  console.log(1);',
      '} else if (true) {',
      '  console.log(2);',
      '} else {',
      '  console.log(3);',
      '}'
    ], [
      '{',
      '  console.log(1);',
      '}'
    ]);

    expectTransform([
      'if (false) {',
      '  console.log(1);',
      '} else if (true) {',
      '  console.log(2);',
      '} else {',
      '  console.log(3);',
      '}'
    ], [
      '{',
      '  console.log(2);',
      '}'
    ]);

    expectTransform([
      'if (false)',
      '  console.log(1);',
      'else if (true)',
      '  console.log(2);',
      'else',
      '  console.log(3);',
    ], [
      'console.log(2);'
    ]);

    expectTransform([
      'if (false || false || func()) {',
      '  console.log(1);',
      '} else if (false ? true : (func())) {',
      '  console.log(2);',
      '} else {',
      '  console.log(3);',
      '}'
    ], [
      'if (func()) {',
      '  console.log(1);',
      '} else if (func()) {',
      '  console.log(2);',
      '} else {',
      '  console.log(3);',
      '}'
    ]);

  });

});
