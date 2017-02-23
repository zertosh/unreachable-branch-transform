var test = require('tap').test;
var transform = require('../').transform;

function expectTransform(t) {
  return function(code_, result_) {
    var code = Array.isArray(code_) ? code_.join('\n') : code_;
    var result = Array.isArray(result_) ? result_.join('\n') : result_;
    return t.equal(transform(code), result);
  };
}


test('unreachable-branch-transform', function(t) {

  //----------------------------------------------------------------------------
  // With side-effects
  //----------------------------------------------------------------------------
  t.test('AssignmentExpression', function(t) {
    expectTransform(t)(
      'foo || (a = new RegExp("")) && bar();',
      'foo || (a = new RegExp("")) && bar();'
    );

    t.end();
  });


  //----------------------------------------------------------------------------
  // ExpressionStatement
  //----------------------------------------------------------------------------

  t.test('ExpressionStatement', function(t) {
    expectTransform(t)(
      'true || true;',
      'true;'
    );

    expectTransform(t)(
      'false || console.log();',
      'console.log();'
    );

    expectTransform(t)(
      'true && console.log();',
      'console.log();'
    );

    expectTransform(t)(
      'true || console.log();',
      'true;'
    );

    expectTransform(t)(
      '"foo" || console.log();',
      '"foo";'
    );

    expectTransform(t)(
      '[1] || console.log();',
      '[1];'
    );

    expectTransform(t)(
      'false && console.log();',
      'false;'
    );

    expectTransform(t)(
      'null && console.log();',
      'null;'
    );

    expectTransform(t)(
      'void 0 && console.log();',
      'void 0;'
    );

    expectTransform(t)(
      'true || undefined === undefined || true;',
      'true;'
    );

    expectTransform(t)(
      '!true && undefined !== undefined && true;',
      '!true;'
    );

    t.end();
  });


  //----------------------------------------------------------------------------
  // VariableDeclarator
  //----------------------------------------------------------------------------

  t.test('VariableDeclarator', function(t) {

    expectTransform(t)(
      'var a = true ? true : true;',
      'var a = true;'
    );

    expectTransform(t)(
      'var a = true ? true : true;',
      'var a = true;'
    );

    expectTransform(t)(
      'var a = false ? true : true;',
      'var a = true;'
    );

    expectTransform(t)(
      'var a = true ? console.log() : true;',
      'var a = console.log();'
    );

    expectTransform(t)(
      'var a = true ? true : console.log();',
      'var a = true;'
    );

    expectTransform(t)(
      'var a = true ? console.log() : console.log();',
      'var a = console.log();'
    );

    expectTransform(t)(
      'var a = "true" ? true : console.log();',
      'var a = true;'
    );

    expectTransform(t)(
      'var a = "true" ? console.log(1) : console.log(2);',
      'var a = console.log(1);'
    );

    expectTransform(t)(
      'var a = "" ? console.log() : true;',
      'var a = true;'
    );

    expectTransform(t)(
      'var a = "" ? console.log(1) : console.log(2);',
      'var a = console.log(2);'
    );

    expectTransform(t)(
      'var a = "production" !== "development" ? console.log(3) : console.log(4);',
      'var a = console.log(3);'
    );

    expectTransform(t)(
      'var a = "production" === "development" ? console.log(5) : console.log(6);',
      'var a = console.log(6);'
    );

    t.end();
  });

  //----------------------------------------------------------------------------
  // IfStatement
  //----------------------------------------------------------------------------

  t.test('IfStatement', function(t) {

    expectTransform(t)(
      'if (true) { console.log(1); } else { console.log(2); }',
      '{ console.log(1); }'
    );

    expectTransform(t)(
      'if (false) { console.log(1); } else { console.log(2); }',
      '{ console.log(2); }'
    );

    expectTransform(t)([
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

    expectTransform(t)([
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

    expectTransform(t)([
      'if (false)',
      '  console.log(1);',
      'else if (true)',
      '  console.log(2);',
      'else',
      '  console.log(3);',
    ], [
      'console.log(2);'
    ]);

    expectTransform(t)([
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

    expectTransform(t)(
      'if (true || undefined === undefined || true) { console.log(1); } else { console.log(2); }',
      '{ console.log(1); }'
    );

    expectTransform(t)(
      'if (!true && undefined !== undefined) { console.log(1); } else { console.log(2); }',
      '{ console.log(2); }'
    );

    t.end();
  });

  t.end();
});
