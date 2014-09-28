var test = require('tape');

test('unreachable-branch-transform', function(t) {

  var transform = require('../').transform;

  function expectTransform(code, result) {
    return transform(code) === result;
  }

  t.test('ConditionalExpression', function(t) {

    t.test('should do nothing', function(t) {
      // True ? Reachable_Constant : Unreachable_Constant
      t.ok(expectTransform(
        'var a = true ? true : true;',
        'var a = true ? true : true;'
      ));
      // False ? Unreachable_Constant : Reachable_Constant
      t.ok(expectTransform(
        'var a = false ? true : true;',
        'var a = false ? true : true;'
      ));
      // True ? Reachable_Indeterminate : Unreachable_Constant
      t.ok(expectTransform(
        'var a = true ? console.log() : true;',
        'var a = true ? console.log() : true;'
      ));
      t.end();
    });

    t.test('should comment out the alternate with boolean test', function(t) {
      // True ? Reachable_Constant : Unreachable_Indeterminate
      t.ok(expectTransform(
        'var a = true ? true : console.log();',
        'var a = true ? true : null /*console.log()*/;'
      ));
      // True ? Reachable_Indeterminate : Unreachable_Indeterminate
      t.ok(expectTransform(
        'var a = true ? console.log() : console.log();',
        'var a = true ? console.log() : null /*console.log()*/;'
      ));
      t.end();
    });

    t.test('should comment out the alternate with string cast test', function(t) {
      // True ? Reachable_Constant : Unreachable_Indeterminate
      t.ok(expectTransform(
        'var a = "true" ? true : console.log();',
        'var a = "true" ? true : null /*console.log()*/;'
      ));
      // True ? Reachable_Indeterminate : Unreachable_Indeterminate
      t.ok(expectTransform(
        'var a = "true" ? console.log() : console.log();',
        'var a = "true" ? console.log() : null /*console.log()*/;'
      ));
      t.end();
    });

    t.test('should comment out the consequent with string cast test', function(t) {
      // True ? Reachable_Constant : Unreachable_Indeterminate
      t.ok(expectTransform(
        'var a = "" ? console.log() : true;',
        'var a = "" ? null /*console.log()*/ : true;'
      ));
      // True ? Reachable_Indeterminate : Unreachable_Indeterminate
      t.ok(expectTransform(
        'var a = "" ? console.log() : console.log();',
        'var a = "" ? null /*console.log()*/ : console.log();'
      ));
      t.end();
    });

    t.end();
  });

  t.test('IfStatement', function(t) {

    t.test('should Comment alternate BlockStatement body', function(t) {
      t.ok(expectTransform(
        'if (true) { console.log(); } else { console.log(); }',
        'if (true) { console.log(); } else {/* console.log(); */}'
      ));
      t.end();
    });

    t.test('should Comment consequent BlockStatement body', function(t) {
      t.ok(expectTransform(
        'if (false) { console.log(); } else { console.log(); }',
        'if (false) {/* console.log(); */} else { console.log(); }'
      ));
      t.end();
    });

    t.test('should Comment alternate IfStatement body', function(t) {
      t.ok(expectTransform([
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
      ].join('\n')));
      t.end();
    });

    t.test('should Comment consequent BlockStatement body and alternate IfStatement alternate', function(t) {
      t.ok(expectTransform([
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
      ].join('\n')));
      t.end();
    });

    t.end();
  });

  t.test('LogicalExpression', function(t) {
    t.test('should do nothing', function(t) {
      t.ok(expectTransform(
        'true || true;',
        'true || true;'
      ));
      t.ok(expectTransform(
        'false || console.log();',
        'false || console.log();'
      ));
      t.ok(expectTransform(
        'true && console.log();',
        'true && console.log();'
      ));
      t.end();
    });

    t.test('should Comment right', function(t) {
      t.ok(expectTransform(
        'true || console.log();',
        'true || null /*console.log()*/;'
      ));
      t.ok(expectTransform(
        'false && console.log();',
        'false && null /*console.log()*/;'
      ));
      t.end();
    });

    t.end();
  });

});
