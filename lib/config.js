/**
 * create and export configuration variables
 *
 *
 */

//container for all the environments

var environments = {};

//Staging (default) environment

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsAsecret",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
  templateGlobals: {
    appName: "UpTimeChecker",
    companyName: "NOtARealCompany, Inc",
    yearCreated: "2020",
    baseUrl: "http://localhost:3000/",
  },
};

//Testing environment
environments.testing = {
  httpPort: 4000,
  httpsPort: 4001,
  envName: "testing",
  hashingSecret: "thisIsAsecret",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
  templateGlobals: {
    appName: "UpTimeChecker",
    companyName: "NOtARealCompany, Inc",
    yearCreated: "2020",
    baseUrl: "http://localhost:3000/",
  },
};

//Production environment

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsAlsoAScret",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
  templateGlobals: {
    appName: "UpTimeChecker",
    companyName: "NOtARealCompany, Inc",
    yearCreated: "2020",
    baseUrl: "http://localhost:5000/",
  },
};

//detwermine which environment was  passed as a command-line arguments.
var currentEnvironment = typeof process.env.NODE_ENV == "string" ? process.env.NODE_ENV.toLocaleLowerCase() : "";

// check that the current environment is one ofthe environments above, if not, default to staging

var environmentToExport = typeof environments[currentEnvironment] === "object" ? environments[currentEnvironment] : environments.staging;

//Export the module

module.exports = environmentToExport;
