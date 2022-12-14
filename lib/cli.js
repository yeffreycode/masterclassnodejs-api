/**
 * Cli -Related tasks
 *
 */

//Dependencies

var readLine = require("readline");
var util = require("util");
var debug = util.debuglog("cli");
var events = require("events");
var os = require("os");
var v8 = require("v8");
var _data = require("./data");
var _logs = require("./logs");
var helpers = require("./helpers");
var childProcess = require("child_process");

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

e.on("list users", function () {
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
  var commands = {
    exit: "kill the CLI (and the rest of the application)",
    man: "Show this help page",
    help: "Alias of the 'man' comman",
    stats: "Get statistics on the underlyying operating system and rosourse utilization",
    "list users": "Show a list of all the register (undeleted) users in the system",
    "more user info --{userId}": "Shwo details of a specific user",
    "list checks --up --down": "Show a list of all the active checks in the system including their state. The '--up' and the '--down' flags are both optional",
    "more check info --{checkId}": "show details of a specific check",
    "list logs": "Show alist of all the log files available to be readd (compressed only)",
    "more log info --{fileName}": "Show details of a specified log file",
  };
  //Show a header for he help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace(2);

  //Show each command, followed by its explanation, in white and yellow respectivly
  for (var key in commands) {
    if (commands.hasOwnProperty(key)) {
      var value = commands[key];
      var line = "\x1b[33m" + key + "\x1b[0m";
      var padding = 60 - line.length;
      for (i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace();

  //End with another horizontalLine
  cli.horizontalLine();
};

//Create a vertical space
cli.verticalSpace = function (lines) {
  lines = typeof lines == "number" && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
    console.log("");
  }
};

//Create a horizontal line across the screen
cli.horizontalLine = function () {
  //Get the available screen size;
  var width = process.stdout.columns;

  var line = "";
  for (i = 0; i < width; i++) {
    line += "-";
  }
  console.log(line);
};

//Create centered text on the screen
cli.centered = function (str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : "";

  //GEt the available screen size
  var width = process.stdout.columns;

  //Calculate the lefft padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  //Put in left padding spaces before the string itself
  var line = "";
  for (i = 0; i < leftPadding; i++) {
    line += " ";
  }
  line += str;
  console.log(line);
};

//Exit
cli.responders.exit = function () {
  process.exit(e);
};

//Stats
cli.responders.stats = function () {
  //Compile an boject of stats
  var stats = {
    "Load Average": os.loadavg().join(" "),
    "CPU Count": os.cpus().length,
    "Free Memory": os.freemem(),
    "Current Malloced Memory": v8.getHeapStatistics().malloced_memory,
    "Peak Malloced Memory": v8.getHeapStatistics().peak_malloced_memory,
    "Allocated Heap Used {%}": Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    "Available Heap Allocated {%}": Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    Uptime: os.uptime() + " Seconds",
  };

  //Create a Header for the stats
  cli.horizontalLine();
  cli.centered("SYSTEM STATISTICS ");
  cli.horizontalLine();
  cli.verticalSpace(2);

  //Log out each stat
  for (var key in stats) {
    if (stats.hasOwnProperty(key)) {
      var value = stats[key];
      var line = "\x1b[33m" + key + "\x1b[0m";
      var padding = 60 - line.length;
      for (i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace();

  //End with another horizontalLine
  cli.horizontalLine();
};

//list users
cli.responders.listUsers = function () {
  _data.list("users", function (err, userIds) {
    if (!err && userIds && userIds.length) {
      cli.verticalSpace();
      userIds.forEach(function (userId) {
        _data.read("users", userId, function (err, userData) {
          if (!err && userData) {
            var line = "Name: " + userData.firstName + " " + userData.lastName + " Phone: " + userData.phone + " Checks: ";
            var numberOfChecks = typeof userData.checks == "object" && userData.checks instanceof Array && userData.checks.length ? userData.checks.length : 0;
            line += numberOfChecks;
            console.log(line + "207");
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

//More user info
cli.responders.moreUserInfo = function (str) {
  //GEt the Id from the string
  var arr = str.split("--");
  var userId = typeof arr[1] == "string" && arr[1].trim().length > 0 ? arr[1] : false;
  if (userId) {
    //Lookup the users
    _data.read("users", userId, function (err, userData) {
      if (!err && userData) {
        //Remove teh hasehd password
        delete userData.hashedPassword;
        //print the JSON with txt highlighting
        cli.verticalSpace();
        console.dir(userData, { Colors: true });
        cli.verticalSpace();
      }
    });
  }
};

//List checks
cli.responders.listChecks = function (str) {
  _data.list("checks", function (err, checkIds) {
    if (!err && checkIds && checkIds.length) {
      cli.verticalSpace();
      checkIds.forEach(function (checkId) {
        _data.read("checks", checkId, function (err, checkData) {
          var includeCheck = false;
          var lowerString = str.toLowerCase();

          //Get the stata, defafult to down
          var state = typeof checkData.state == "string" ? checkData.state : "down";

          //GEt the state, default to ddwn
          var stateOrUnknown = typeof checkData.state == "string" ? checkData.state : "unknown";
          //if the user specified the state, or hasn't specified any state, include the current check accordinly
          if (lowerString.indexOf("--" + state) > -1 || (lowerString.indexOf("--down") == -1 && lowerString.indexOf("--up") == -1)) {
            var line = "ID: " + checkData.id + " " + checkData.method.toUpperCase() + " " + checkData.protocol + "://" + checkData.url + " State: " + stateOrUnknown;
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

//More check info
cli.responders.moreCheckInfo = function (str) {
  //GEt the Id from the string
  var arr = str.split("--");
  var checkId = typeof arr[1] == "string" && arr[1].trim().length > 0 ? arr[1] : false;
  if (checkId) {
    //Lookup the check
    _data.read("checks", checkId, function (err, checkData) {
      if (!err && checkData) {
        //print the JSON with txt highlighting
        cli.verticalSpace();
        console.dir(checkData, { colors: true });
        cli.verticalSpace();
      }
    });
  }
};

//list logs
cli.responders.listLogs = function () {
  // var ls = childProcess.spawn("ls", ["./.logs/"]);
  // ls.stdout.on("data", function (dataObj) {
  //   //Explode into separte lines
  //   var dataStr = dataObj.toString();
  //   var logFileNames = dataStr.split("\n");
  //   cli.verticalSpace();
  //   logFileNames.forEach(function (logFileName) {
  //     if (typeof logFileName == "string" && logFileName.length && logFileName.indexOf("-") > -1) {
  //       console.log(logFileName.trim().split(".")[0]);
  //       cli.verticalSpace();
  //     }
  //   });
  // });
  console.log("view list logs");
};

//More logs info
cli.responders.moreLogInfo = function (str) {
  //Get the logFileName from the string
  var arr = str.split("--");
  var logFileName = typeof arr[1] == "string" && arr[1].trim().length > 0 ? arr[1] : false;
  if (logFileName) {
    cli.verticalSpace();
    //Decompress the log
    _logs.decompress(logFileName, function (err, strData) {
      if (!err && strData) {
        // Split into lines
        var arr = strData.split("\n");
        arr.forEach(function (jsonString) {
          var logObject = helpers.parseJsonToObject(jsonString);
          if (logObject && JSON.stringify(logObject) !== "{}") {
            console.dir(logObject, { colors: true });
            cli.verticalSpace();
          }
        });
      }
    });
  }
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
