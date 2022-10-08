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
			}
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

	router.get("/room/open/:name", async (req, res) => {
		try {
			const room = roomManager.findRoom(req.params.name);
			if(room.hasPassword()) {
				res.redirect("/");
			}
			else {
				res.redirect(`/room/${room.id}`);
			}
		} catch (err) {
			console.error(err);
			res.redirect("/");
		}
	});

	router.post("/room/validate", async (req, res) => {
		const {password, name} = req.body;
		
		const room = roomManager.findRoom(name);
		if (room === null) {
			// Implement the below code after setting up sessions.
			// req.locals.errors = ["Room doesn't exist"];
			res.redirect("/");
		}
		else
			try {
				const passwordsMatch = await room.comparePasswords(password);
				if(passwordsMatch) {
					res.redirect(`/room/${room.id}`);
				} else {
					// Implement the below code after setting up sessions.
					// req.locals.errors = ["Invalid password"];
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
			}
		});
	});

	router.get("/", (req, res) => {
		res.render("chess/roomSelection", {
			pageData: {
				scripts: ["selection.io"],
				styleSheets: ["room-table"],
				needsFontAwesome: true,
			},
		});

		router.get("/api/getRooms", (req, res) => {
			const roomsArray = roomManager.fetchRooms();

			const dataToSend = roomsArray.map((room) => {
				return ({
					name: room.name,
					playerNum: room.players.length,
					password: room.hasPassword(),
				});
			});

			res.status(200).json(dataToSend);
		});

		router.post("/api/makeRoom", async (req, res) => {
			let errors = [];
			const {name, password} = req.body;
			if(name.length < 3) {
				errors.push("The room's name must be at least three characters");
				res.status(400).json({"errors": errors});
			}
			else try {
				const room = roomManager.addRoom(name, "testacles");
				if(password) await room.setPassword(password);
				res.redirect(`/room/${room.id}`);
			} catch (err) {
				errors.push(err.message);
				res.status(409).json({"errors": errors});
			}
		});

		router.get("/api/clearRooms", (req, res) => {
			const result = roomManager.clearRooms();
			res.status(200).json({rooms: result});
		});
	});

	
	return router;
};
