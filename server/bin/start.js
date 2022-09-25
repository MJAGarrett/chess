import http from "http";
// import config from "../config";
import appSetup from "../app.js";

const app = appSetup();
const PORT = 3000;

app.set("port", PORT);

const server = http.createServer(app);

server.addListener("listening", () => {
	console.log(`App listening on port ${PORT}`);
});

server.listen(PORT);
