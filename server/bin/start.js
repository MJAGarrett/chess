import http from "http";
// import config from "../config";
import appSetup from "../app.js";
import { Server } from "socket.io";

const app = appSetup();
const PORT = 3000;

app.set("port", PORT);

const server = http.createServer(app);
const io = new Server(server);

server.addListener("listening", () => {
  console.log(`App listening on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("gamemove", (move) => {
    socket.broadcast.emit("gamemove", move);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

server.listen(PORT);
