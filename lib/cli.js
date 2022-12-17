/**
 * Cli -Related tasks
 *
 */

//Dependencies

var readLine = require("readline");
var util = require("util");
var debug = util.debuglog("cli");
var events = require("events");

class _events extends events {}
var e = new _events();

//Instantiate the CLI module object
var cli = {};

//Input handlers
e.on("man", function (str) {
  cli.responders.help();
});

e.on("help", function (str) {
  cli.responders.help();
});

e.on("exit", function (str) {
  cli.responders.exit();
});

e.on("stats", function (str) {
  cli.responders.stats();
});

e.on("list users", function (str) {
  cli.responders.listUsers();
});

e.on("more user info", function (str) {
  cli.responders.moreUserInfo(str);
});

e.on("list checks", function (str) {
  cli.responders.listChecks(str);
});

e.on("more check info", function (str) {
  cli.responders.moreCheckInfo(str);
});

e.on("list logs", function (str) {
  cli.responders.listLogs();
});

e.on("more log info", function (str) {
  cli.responders.moreLogInfo(str);
});

e.on("help", function (str) {
  cli.responders.help();
});

//REsponders object
cli.responders = {};

//Help / Man
cli.responders.help = function () {
  console.log("Your asked for help");
};

//Exit
cli.responders.exit = function () {
  process.exit(e);
};

//Stats
cli.responders.stats = function () {
  console.log("Your asked for stats");
};

//list users
cli.responders.listUsers = function () {
  console.log("Your asked for list users");
};

//More user info
cli.responders.moreUserInfo = function (str) {
  console.log("Your asked for more user info", str);
};

//List checks
cli.responders.listChecks = function (str) {
  console.log("Your asked for list checks", str);
};

//More check info
cli.responders.moreCheckInfo = function (str) {
  console.log("Your asked for more check info", str);
};

//list logs
cli.responders.listLogs = function () {
  console.log("Your asked for list logs");
};

//More logs info
cli.responders.moreLogInfo = function (str) {
  console.log("Your asked for more log info", str);
};

//INput processor
cli.processInput = function (str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : false;
  //Onley process the input if the user actually wrote something. Otherwise ignore
  if (str) {
    //Codify the unique strings that indetify the unique questions allowed to be asked
    var uniqueInputs = ["man", "help", "exit", "stats", "list users", "more user info", "list checks", "more check info", "list logs", "more log info"];

    //Go through the possible inputs, emit and event when a match is found
    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function (input) {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        //Emit an event matching the unique input and inclue the full string given body user
        e.emit(input, str);
        return true;
      }
    });
    //if no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Sorry, try again");
    }
  }
};

//Init Script
cli.init = function () {
  //Send the start message to the console, in dark blue
  console.log("\x1b[34m%s\x1b[0m", "the  Cli  is running ");

  //Start the interface
  var _interface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "$ ",
  });

  //Create an initial prompt
  _interface.prompt();

  //Handle each line of input separately
  _interface.on("line", function (str) {
    //send to the input processor
    cli.processInput(str);

    //Re-initialize thee prompt afterwards
    _interface.prompt();
  });

  //If the user stops the CLI, skill the associated process
  _interface.on("close", function () {
    process.exit(0);
  });
};

//export the module
module.exports = cli;
