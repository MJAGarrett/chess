import http from "http";
// import config from "../config";
import appSetup from "../app.js";
import { Server } from "socket.io";
import socketSetup from "../socket/socketSetup.js";

const app = appSetup();
const PORT = 3000;

app.set("port", PORT);

const server = http.createServer(app);
const io = new Server(server);

socketSetup(io);

server.addListener("listening", () => {
	console.log(`App listening on port ${PORT}`);
});


server.listen(PORT);
