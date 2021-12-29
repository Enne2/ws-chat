"use strict";

const express = require("express");
const path = require("path");
const { createServer } = require("http");
var Moniker = require("moniker");

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 7071 });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var chat = [{ id: "Sistema", date: Date.now(), data: "Server Avviato" }];
var names = [];
const server = createServer(app);

wss.on("connection", function (ws) {
  console.log("started client interval");
  console.log(JSON.stringify({ type: "starter", chat: chat }));
  ws.send(JSON.stringify({ type: "starter", data: chat }));
  ws.on("close", function () {
    console.log("stopping client interval");
  });
});

server.listen(9080, function () {
  console.log("In ascolto http://localhost:9080");
});

app.post("/send", (req, res) => {
  if (names[req.body.id] === undefined) names[req.body.id] = Moniker.choose();
  res.send(
    JSON.stringify({
      type: "message",
      data: { id: names[req.body.id], date: Date.now(), data: req.body.data },
    })
  );
  console.log({ id: names[req.body.id], date: Date.now(), data: req.body.data });
  chat.push({ id: names[req.body.id], date: Date.now(), data: req.body.data });
  if (chat.length > 5) chat.shift();
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "message",
          data: { id: names[req.body.id], date: Date.now(), data: req.body.data },
        })
      );
    }
  });
});
