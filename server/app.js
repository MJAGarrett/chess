import express from "express";
import * as path from "path";
import httpErrors from "http-errors";
import routes from "./routes";

export default () => {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "./views"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/", express.static(path.join(__dirname, "../public")));

  app.use("/", routes());

  // Catch 404 errors and send them to the error handler.
  app.use((req, res, next) => {
    next(httpErrors(404));
  });

  app.use((err, req, res) => {
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.render("error");
  });

  return app;
};
