import { Router } from "express";

const router = Router();

export default () => {

	router.get("/singleplayer/:difficulty", (req, res) => {
		res.render("chess", {
			pageData: {
				scripts: ["singleplayer"],
				styleSheets: ["chess"],
				needsFontAwesome: true,
			},
			AIDifficulty: req.params.difficulty,
		});
	});
	router.get("/LAN", (req, res) => {
		res.render("chess", {
			pageData: {
				scripts: ["singleplayer"],
				styleSheets: ["chess"],
				needsFontAwesome: true,
				AIDifficulty: null,
			},
		});
	});

	router.get("/:id", (req, res) => {
		res.render("chess/index", {
			pageData: {
				styleSheets: ["chess"],
				scripts: ["joinRoom"],
				needsFontAwesome: true,
			},
			id: req.params.id,
		});
	});

	router.post("/newroom", (req, res) => {
		res.render("chess/index", {
			pageData: {
				styleSheets: ["chess"],
				scripts: ["joinRoom"],
				needsFontAwesome: true,
			},
			room: req.body.roomName,
		});
	});

	router.get("/", (req, res) => {
		res.render("chess/roomSelection", {
			pageData: {
				scripts: ["selection.io"],
				styleSheets: ["room-table"],
				// needsFontAwesome: true,
			},
		});
	});

	
	return router;
};
