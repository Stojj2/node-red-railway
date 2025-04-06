const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const aedes = require("aedes")();
const net = require("net");
const RED = require("node-red");

const app = express();
const server = http.createServer(app);

// MQTT broker via TCP
net.createServer(aedes.handle).listen(1883, () => {
  console.log("🟢 MQTT (Aedes) broker lyssnar på port 1883 (TCP)");
});

// WebSocket MQTT på 8081
const wsApp = express();
const wsServer = http.createServer(wsApp);
const ws = new WebSocket.Server({ server: wsServer, path: "/mqtt" });
ws.on("connection", (stream) => {
  aedes.handle(stream);
  console.log("📡 WebSocket MQTT-anslutning");
});
wsServer.listen(8081, () => {
  console.log("🟢 WebSocket server lyssnar på port 8081 (/mqtt)");
});

// Node-RED setup
const settings = {
  httpAdminRoot: "/",
  httpNodeRoot: "/",
  userDir: "./.nodered",
  functionGlobalContext: {},
  flowFile: "flows.json",
  uiPort: 1880,
};

RED.init(server, settings);
app.use(settings.httpAdminRoot, RED.httpAdmin);
app.use(settings.httpNodeRoot, RED.httpNode);

setTimeout(() => {
  server.listen(settings.uiPort, "0.0.0.0", () => {
    console.log(`🟢 Node-RED lyssnar på port ${settings.uiPort}`);
  });
  RED.start();
}, 2000);
