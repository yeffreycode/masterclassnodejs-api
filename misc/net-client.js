/**
 * Example TCP (net) Client
 *
 * connects to port 6000 and send the world 'ping' to server
 */

//Dependencies
var net = require("net");

//define the message to send
var outboundMessage = "ping";

//Create the client
var client = net.createConnection({ port: 6000 }, function () {
  //Send the message
  client.write(outboundMessage);
});

//When the server writes back, log what is says then kill the client

client.on("data", function (inboundMessage) {
  var messageString = inboundMessage.toString();
  console.log("I wrote " + outboundMessage + " and they said " + messageString);
  client.end();
});
