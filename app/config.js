/**
 * create and export configuration variables
 *
 *
 */

//container for all the environments

var environments = {};

//Staging (default) environment

environments.staging = {
  port: 3000,
  envName: "staging",
};

//Production environment

environments.production = {
  port: 5000,
  envName: "production",
};

//detwermine which environment was  passed as a command-line arguments.
var currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLocaleLowerCase()
    : "";

// check that the current environment is one ofthe environments above, if not, default to staging

var environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

//Export the module

module.exports = environmentToExport;
