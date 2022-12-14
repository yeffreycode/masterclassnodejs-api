/**
 * Frontend logic or the application
 */

//Container or the frontednd application
var app = {};

//config
app.config = {
  sessionToken: false,
};

//Ajax client for the restful API

app.client = {};

//interface for making API calls

app.client.request = function (headers, path, method, queryStringObject, payload, callback) {
  //Set defaults
  headers = typeof headers == "object" && headers !== null ? headers : {};
  path = typeof path == "string" ? path : "/";
  method = typeof method == "string" && ["POST", "GET", "PUT", "DELETE"].indexOf(method) > -1 ? method.toUpperCase() : "GET";
  queryStringObject = typeof queryStringObject == "object" && queryStringObject !== null ? queryStringObject : {};
  payload = typeof payload == "object" && payload !== null ? payload : {};
  callback = typeof callback == "function" ? callback : false;

  // for each query string parameter sent, add it to the path
  var requestUrl = path + "?";
  var counter = 0;
  for (var queryKey in queryStringObject) {
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++;
      //if a at least one query string parameter has already been added, prepend new one with an ampersand
      if (counter > 1) {
        requestUrl += "&";
      }
      //Add the key and value
      requestUrl += queryKey + "=" + queryStringObject[queryKey];
    }
  }
  //Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  //for each header sent, add it to the request
  for (var headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  //if there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }
  //when the request comes back, handle the response
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var statusCode = xhr.status;
      var responseReturned = xhr.responseText;
      //callback if requested
      if (callback) {
        try {
          var parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }
      }
    }
  };
  //Send the paylaod as JSON
  var paylaodString = JSON.stringify(payload);
  xhr.send(paylaodString);
};

// Bind the forms
app.bindForms = function () {
  if (document.querySelector("form")) {
    var allForms = document.querySelectorAll("form");
    for (var i = 0; i < allForms.length; i++) {
      allForms[i].addEventListener("submit", function (e) {
        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#" + formId + " .formError").style.display = "none";

        // Hide the success message (if it's currently shown due to a previous error)
        if (document.querySelector("#" + formId + " .formSuccess")) {
          document.querySelector("#" + formId + " .formSuccess").style.display = "none";
        }

        // Turn the inputs into a payload
        var payload = {};
        var elements = this.elements;
        for (var i = 0; i < elements.length; i++) {
          if (elements[i].type !== "submit") {
            // Determine class of element and set value accordingly
            var classOfElement = typeof elements[i].classList.value == "string" && elements[i].classList.value.length > 0 ? elements[i].classList.value : "";
            var valueOfElement =
              elements[i].type == "checkbox" && classOfElement.indexOf("multiselect") == -1
                ? elements[i].checked
                : classOfElement.indexOf("intval") == -1
                ? elements[i].value
                : parseInt(elements[i].value);
            var elementIsChecked = elements[i].checked;
            // Override the method of the form if the input's name is _method
            var nameOfElement = elements[i].name;
            if (nameOfElement == "_method") {
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if (nameOfElement == "httpmethod") {
                nameOfElement = "method";
              }
              // Create an payload field named "id" if the elements name is actually uid
              if (nameOfElement == "uid") {
                nameOfElement = "id";
              }
              // If the element has the class "multiselect" add its value(s) as array elements
              if (classOfElement.indexOf("multiselect") > -1) {
                if (elementIsChecked) {
                  payload[nameOfElement] = typeof payload[nameOfElement] == "object" && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }
            }
          }
        }

        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == "DELETE" ? payload : {};

        // Call the API
        app.client.request(undefined, path, method, queryStringObject, payload, function (statusCode, responsePayload) {
          // Display an error on the form if needed
          if (statusCode !== 200) {
            if (statusCode == 403) {
              // log the user out
              app.logUserOut();
            } else {
              // Try to get the error from the api, or set a default error message
              var error = typeof responsePayload.Error == "string" ? responsePayload.Error : "An error has occured, please try again";

              // Set the formError field with the error text
              document.querySelector("#" + formId + " .formError").innerHTML = error;

              // Show (unhide) the form error field on the form
              document.querySelector("#" + formId + " .formError").style.display = "block";
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId, payload, responsePayload);
          }
        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if (formId == "accountCreate") {
    // // Take the phone and password, and use it to log the user in
    // var newPayload = {
    //   phone: requestPayload.phone,
    //   password: requestPayload.password,
    // };
    // app.client.request(undefined, "api/tokens", "POST", undefined, newPayload, function (newStatusCode, newResponsePayload) {
    //   // Display an error on the form if needed
    //   if (newStatusCode !== 200) {
    //     // Set the formError field with the error text
    //     document.querySelector("#" + formId + " .formError").innerHTML = "Sorry, an error has occured. Please try again.";
    //     // Show (unhide) the form error field on the form
    //     document.querySelector("#" + formId + " .formError").style.display = "block";
    //   } else {
    //     // If successful, set the token and redirect the user
    //     app.setSessionToken(newResponsePayload);
    //     window.location = "/checks/all";
    //   }
    // });
  }
  //   // If login was successful, set the token in localstorage and redirect the user
  //   if (formId == "sessionCreate") {
  //     app.setSessionToken(responsePayload);
  //     window.location = "/checks/all";
  //   }

  //   // If forms saved successfully and they have success messages, show them
  //   var formsWithSuccessMessages = ["accountEdit1", "accountEdit2", "checksEdit1"];
  //   if (formsWithSuccessMessages.indexOf(formId) > -1) {
  //     document.querySelector("#" + formId + " .formSuccess").style.display = "block";
  //   }

  //   // If the user just deleted their account, redirect them to the account-delete page
  //   if (formId == "accountEdit3") {
  //     app.logUserOut(false);
  //     window.location = "/account/deleted";
  //   }

  //   // If the user just created a new check successfully, redirect back to the dashboard
  //   if (formId == "checksCreate") {
  //     window.location = "/checks/all";
  //   }

  //   // If the user just deleted a check, redirect them to the dashboard
  //   if (formId == "checksEdit2") {
  //     window.location = "/checks/all";
  //   }
};

// Init (bootstrapping)
app.init = function () {
  // Bind all form submissions
  app.bindForms();
};

// Call the init processes after the window loads
window.onload = function () {
  app.init();
};
