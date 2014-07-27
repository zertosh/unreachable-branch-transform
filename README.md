unreachable-branch
==================

Comments out unreachable code branches in `if` statements, ternaries `?`, and logical operations `||` `&&`, where the test is determinable (like comparing two constants). This is similar to what [UglifyJS](https://github.com/mishoo/UglifyJS2)'s "dead_code" compressor option does, but without the extra code transformations. Unlike UglifyJS, instead of removing the "dead code", it is wrapped in a comment `/* ... */`. This enables further transformations and easy debugging (since you can still see the code that was unreachable).

When combined with something like [envify](https://github.com/hughsk/envify) and [browserify](https://github.com/substack/node-browserify), you can perform conditional `require` calls without including more code than you need.

#### Example outputs #####

```js
// original 
var transport = process.env.TARGET === 'client' ? require('ajax') : require('fs');

// after envify and unreachable-branch
var transport = 'server' === 'client' ? null /*require('ajax')*/ : require('fs');
```

```js
// original
if (process.env.NODE_ENV === 'development') {
  console.log('in dev mode');
} else {
  console.log('in some other mode');
}

// after envify and unreachable-branch
if ('production' === 'development') {/*
  console.log('in dev mode');
*/} else {
  console.log('in some other mode');
}
```

#### Usage #####

* `unreachable-branch` can be used a [browserify](https://github.com/substack/node-browserify) transform. Just include it like any other transform.
* `unreachable-branch` can also be used on raw code by calling the `transform` function exposed by requiring the package.
* For more control, you can also use the `jstransform` visitors directly via the `visitorList` property on the module.


Credit
------
`lib/evaluator.js` is from the [esmangle](https://github.com/Constellation/esmangle) project.
