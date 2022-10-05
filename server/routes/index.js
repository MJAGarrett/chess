import { Router } from "express";

const router = Router();

export default (services) => {
	const {roomManager} = services;

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
			},
		});
	});

	router.post("/room/validate", async (req, res) => {
		const {password, roomId} = req.body;
		try {
			const room = roomManager.findRoomById(roomId);
			const passwordsMatch = await room.comparePasswords(password);

			if(passwordsMatch) {
				res.redirect(`/room/${roomId}`);
			} else {
				res.redirect("/");
			}
		} catch (err) {
			console.error(err);
			throw err;
		}
		
	});

	router.get("/room/:id", (req, res) => {
		res.render("chess/index", {
			pageData: {
				styleSheets: ["chess"],
				scripts: ["joinRoom"],
				needsFontAwesome: true,
			},
			id: req.params.id,
		});
	});

	router.get("/newroom", (req, res) => {
		res.render("chess/index", {
			pageData: {
				styleSheets: ["chess"],
				scripts: ["joinRoom"],
				needsFontAwesome: true,
			},
			online: true,
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
