var fs = require('fs'),
    path = require('path'),
    async = require('async');

module.exports = function (dirname, callback) {
  var moduleDir = path.join(dirname, 'node_modules'),
      ignored   = [];

  //
  // ### function ignoreTests (dir, next)
  // Checks to see if the npmignore file in `dir` ignores tests
  //
  function ignoreTests(dir, next) {
    var ignorePath = path.join(moduleDir, dir, '.npmignore');

    fs.readFile(ignorePath, 'utf8', function (err, lines) {
      if (err && err.code !== 'ENOENT') {
        return next(err);
      }
      else if (err) {
        return next();
      }

      var tests = lines.split(/\r|\n/g)
        .filter(function (line) {
          return line.indexOf('test') !== -1;
        });

      if (tests.length) {
        ignored.push(dir);
        console.log('%s ignores [%s]', dir, tests.join(', '))
      }

      next();
    });
  }

  fs.readdir(moduleDir, function (err, modules) {
    if (err) { return callback(err); }
    async.forEachLimit(modules, 10, ignoreTests, callback);
  });
};