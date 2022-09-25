import { Router } from "express";

const router = Router();

export default () => {
	router.get("/", (req, res) => {
		res.render("chess/index");
	});
	return router;
};
