import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { InterviewRoom } from "./InterviewRoom.js";

const app = express();
app.disable("x-powered-by");
app.get("/health", (_req, res) =>
  res.json({ status: "ok", game: "interview-survival" }),
);
const dist = fileURLToPath(new URL("../dist", import.meta.url));
app.use(express.static(dist));
app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
const server = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
    maxPayload: 100 * 1024,
  }),
});
server.define("interview", InterviewRoom);
const port = Number(process.env.PORT || 2567);
await server.listen(port, "0.0.0.0");
console.log(`Interview Run multiplayer server → http://localhost:${port}`);
