/**
 * Test runner
 */

//Dependencies
var helpers = require("./../lib/helpers");
var assert = require("assert");

//Application logic for the test runner
var _app = {};
//container for the tests
_app.tests = {
  unit: {},
};

//Assert that the getANumber function is returning a number
_app.tests.unit["helpers.getANumber should return a number"] = function (done) {
  var val = helpers.getANumber();
  assert.equal(typeof val, "number");
  done();
};

//Assert that the getANumber function is returning a 1
_app.tests.unit["helpers.getANumber should return 1"] = function (done) {
  var val = helpers.getANumber();
  assert.equal(val, 1);
  done();
};

//Assert that the getANumber function is returning a 2
_app.tests.unit["helpers.getANumber should return 2"] = function (done) {
  var val = helpers.getANumber();
  assert.equal(val, 2);
  done();
};

//Count all te tests
_app.countTests = function () {
  var counter = 0;
  for (var key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for (var testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
};

//Run all the tests, collecting the errors and successes
_app.runTests = function () {
  var errors = [];
  var successes = 0;
  var limit = _app.countTests();
  var counter = 0;
  for (var key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for (var testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (function () {
            var tmpTestName = testName;
            var testValue = subTests[testName];
            //call the test
            try {
              testValue(function () {
                //if it calls back without trowing, then it succeeded, so log it in green
                console.log("\x1b[32m%s\x1b[0m", tmpTestName);
                counter++;
                successes++;
                if (counter == limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch (e) {
              //if it throw, the int failed, so capture the error thrown and log t in red
              errors.push({
                name: testName,
                error: e,
              });
              console.log("\x1b[31m%s\x1b[0m", tmpTestName);
              counter++;
              if (counter == limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};

//Produce a test aoutcome report
_app.produceTestReport = function (limit, successes, errors) {
  console.log("");
  console.log("-----------BEGIN TEST REPORT -----------");
  console.log("");
  console.log("Total Tests: ", limit);
  console.log("Pass: ", successes);
  console.log("Fail: ", errors.length);
  console.log("");
  //If there are errors, print them in detail
  if (errors.length) {
    console.log("-----------BEGIN ERROR DETAILS -----------");
    console.log("");
    errors.forEach(function (testError) {
      console.log("\x1b[31m%s\x1b[0m", testError.name);
      console.log(testError.error);
      console.log(");");
    });
    console.log("");
    console.log("-----------END ERROR DETAILS -----------");
  }
  console.log("");
  console.log("-----------END TEST REPORT -----------");
};

//Run the tests

_app.runTests();