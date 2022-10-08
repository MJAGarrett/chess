import http from "http";
// import config from "../config";
import appSetup from "../app.js";
import { Server } from "socket.io";
import socketSetup from "../socket/socketSetup.js";
import RoomManager from "../models/RoomManager.js";

const roomManager = new RoomManager();

const app = appSetup({roomManager});
const PORT = 3000;

app.set("port", PORT);

const server = http.createServer(app);
const io = new Server(server);

socketSetup(io, roomManager);

server.addListener("listening", () => {
	console.log(`App listening on port ${PORT}`);
});

server.listen(PORT);

export default server; // testing purposes

export { roomManager };
