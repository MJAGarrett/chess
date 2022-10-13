import express from "express";
import * as path from "path";
import httpErrors from "http-errors";
import routes from "./routes";

export default (services) => {
	const app = express();

	app.set("view engine", "ejs");

	// eslint-disable-next-line no-undef
	app.set("views", path.join(__dirname, "./views"));

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// eslint-disable-next-line no-undef
	app.use("/", express.static(path.join(__dirname, "../public")));

	app.use("/", routes(services));

	// Catch 404 errors and send them to the error handler.
	app.use((req, res, next) => {
		next(httpErrors(404, "The requested page cannot be found", 
		));
	});

	// eslint-disable-next-line no-unused-vars
	app.use((err, req, res, next) => {
		res.locals.error = req.app.get("env") === "development" ? err : {};
		res.status(err.status || 500);
		res.render("error");
	});

	return app;
};
