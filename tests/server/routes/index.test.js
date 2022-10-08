import chai from "chai";
import chaiHttp from "chai-http";
import { v4 as uuidv4 } from "uuid";

import server, {roomManager} from "../../../server/bin/start.js";

chai.use(chaiHttp);

// eslint-disable-next-line no-unused-vars
const should = chai.should();

describe("Index Routes", () => {
	let requester;
	
	before(async () => {
		requester = await chai.request(server).keepOpen();
	});

	after(async () => {
		await requester.close();
	});

	describe("/", () => {
		it("It should return a page", async () => {
			const res = await requester.get("/");
			res.status.should.equal(200);
			res.should.be.html;
		});
	});

	describe("/api", () => {
	
		afterEach(async () => {
			await requester.get("/api/clearRooms");
		});
	
		describe("/makeRoom", () => {
			it("it should make a room when there is no password", async () => {
				const res = await requester.post("/api/makeRoom").send({name: "Steven"});
				res.status.should.equal(200);
				res.should.redirect;
			});
	
			it("it should make a room when there is a password", async () => {
				const res = await requester.post("/api/makeRoom").send({name: "Steven", password: "Samuel"});
				res.status.should.equal(200);
				res.should.redirect;
			});
	
			it("it should not allow a room with a name that already exists.", async () => {
				await requester.post("/api/makeRoom").send({name: "Steven"});
				const res = await requester.post("/api/makeRoom").send({name: "Steven"});
				res.status.should.equal(409);
				res.should.be.json;
				res.body.should.have.property("errors");
			});
	
			it("it should reject a room name that is less than three characters", async () => {
				const res = await requester.post("/api/makeRoom").send({name: "s"});
				res.status.should.equal(400);
				res.should.be.json;
				res.body.should.have.property("errors");
			});
		});
	
		describe("/getRooms", () => {
			it("should return an empty array if there are no rooms.", async () => {
				const res = await requester.get("/api/getRooms");
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a("array");
				res.body.length.should.be.eql(0);
			});
	
			it("it should return an array containing all rooms", async () => {
				for(let i = 0; i < 2; i++) {
					const x = 5 * i;
					await createUniqueRooms(x, requester);
					const res = await requester.get("/api/getRooms");
					res.status.should.equal(200);
					res.should.be.json;
					res.body.length.should.be.eql(x);
				}
			});
		});
	});

	describe("/room", () => {

		afterEach(async () => {
			await requester.get("/api/clearRooms");
		});

		describe("/validate", () => {
			it("Should reject an incorrect password", async () => {
				await requester.post("/api/makeRoom").send({name: "steven", password: "password"});
				const res = await requester.post("/room/validate").send({password: "erica", name: "steven" });

				res.should.redirectTo("http://127.0.0.1:3000/");
			});

			it("It should reject a request if the room requested doesn't exist", async () => {
				const res = await requester.post("/room/validate").send({password: "password", roomId: "4223"});

				res.should.redirectTo("http://127.0.0.1:3000/");
			});

			it("It should redirect to the appropriate url if the password matches", async () => {
				await requester.post("/api/makeRoom").send({name: "steven", password: "password"});
				const roomId = roomManager.findRoom("steven").id;
				const res = await requester.post("/room/validate").send({password: "password", name: "steven" });

				res.status.should.equal(200);
				res.should.redirectTo(`http://127.0.0.1:3000/room/${roomId}`);
			});
		});
	});
});





/**
 * A helper function that creates a number of fake rooms with which to test the APIs.
 * 
 * @param {Number} x Number of rooms to create.
 * @param {ChaiHttp.Agent} requester An instance of the ChaiHttp agent used to make requests against the server.
 * @returns {void}
 */
async function createUniqueRooms(x, requester) {
	for (let i = 0; i < x; i++) {
		await requester.post("/api/makeRoom").send({name: uuidv4()});
	}
}