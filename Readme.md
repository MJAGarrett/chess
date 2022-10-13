# Simple Chess Game Server

This is a personal training project consisting of a basic http server that will serve web pages that allow users to play chess games. The app offers both singleplayer and two-player online chess games.

This project is as of yet unfinished and many things will change.

## Technologies Used
### Major Tech
- Nodejs v16.15.1
- NPM v8.11.0

### Packages
- Express v4.18.1
- Socket.io v4.5.2
- EJS v3.1.8
- Nodemon v2.0.20
- UUID v9.0.0
- Bcrypt v5.0.1
- dotenv v16.0.2
- http-errors v2.0.0

### Development Packages
- Babel
- - CLI v7.18.10
- - Core v7.19.1
- - Preset-env v7.19.1
- - Node v7.19.1
- Chai v4.3.6
- ChaiHttp v4.3.0
- ESLint v8.24.0
- Mocha v10.0.0
- Prettier v2.7.1
- TypeScript v4.8.4

## Launch

This project requires Nodejs and NPM.

This project contains the server configuration required to run the app. To run it for development purposes you will need to use a terminal to navigate to the directory you have installed it to and and run <code>npm i</code> to install all dependencies. Then run the command <code>npm start</code> and a local server will start up and listen on port 3000. After that simply use a web browser to navigate to http://localhost:3000 and you will be able to interact with the app. To close the app, type ctrl+C in the terminal with the app running.

## General Info

- [Project Status](#status)
- [How It Works](#How-It-Works)
- [Future Plans](#plans)
- [What I Have Learned](#learnings)
- [Thank You](#thanks)

### Project Status <a name="status" />

As of writing this Readme, October 13, 2022, this is an ongoing project. And a non-exhaustive list of some issues that need to be addressed are below.

- The front-end aesthetics are lacking, and will be improved on.
- The code for the game on the font-end will need to be expanded to account for events such as a player quitting the game in multiplayer. At the moment there is no such feedback which is terrible user experience.
- The basic back-end structure is there, however many changes need to made. 
- - For example, input needs to be validated and sanitized when creating rooms. 
- - Socket.io is used to push game state changes between two players in a game, this data pathway also needs to be secured.
- - Currently, game rooms are stored in memory, migration to a database is necessary for scalability.

### How It Works <a name="How-It-Works"/>

This app spins up a Nodejs http server that uses ejs to create and serve html templates that contain the necessary JavaScript to run in-browser chess games. The app offers both single-player and two-player online multiplayer games. 

Single-player has three different AI difficulties. Easy is a basic AI that chooses moves at random. Medium is an AI that will prioritize capturing pieces and try not to lose their own. Hard is, as of October 13, 2022, implemented, but not performing to a satisfactory degree.

Online games are implemented as "Rooms" (objects) server side and are created in tandem with Socket.io rooms to facilitate sending board state between client and server. Rooms contain information about the state of the game and the room that houses it. For example, a room will have a name, know how many players are in it, if the game has started, and contain a unique ID that will be used to connect players and set up a Socket.io room.

The first page the app provides will show a table of all open game rooms and options for single-player. From this page a player can join a room if it doesn't require a password, or if the player enters the correct password. The player can also create their own room. The only requirement is that a room's name is above 3 characters and that it is unique.

### Future Plans (as of 10/12/2022) <a name="plans" />

The app currently works, although there are several security concerns that must be addressed, as well as user experience issues which must be resolved. Scalability is also handicapped by the reliance on in-memory data storage and largely synchronous operations on the backend. As such there are many things I plan to do with this app. The below list is a snapshot of the issues that were at the forefront of my mind on October 13, 2022. As such, the list is not complete and subject to change as the project continues.

##### High Priority
- Add input validation to all input pathways.
- Migrate to a database solution to room-management, both for Socket.io rooms and app specific rooms.
- After migration switch all possible back-end operations to asynchronous implementations.
- Write more tests to provide a more stable foundation on which to expand the app and allow for catching bugs earlier and quicker. Long term goal is to switch into a more TDD-style development process.

##### Medium Priority
- Add user feedback to online game state changes where interactivity is restricted/prevented. For example, while waiting for a second player, after a player quits a game midway through.
- Add a message system that will alert users as to why a particular move is not possible/why a piece cannot be selected.

##### Low Priority
- Changing styles to a more visually-appealing design and making sure the design is displayed appropriately on all screen sizes.
- Implement a better version of the hard AI (low priority as it will likely take a bit of study before I can competently model a move tree).
- Switch current method for selecting pawn promotion piece from text-entry to a tile-based selection. Should allow for better control of user actions and reduce liklihood of errors(both user and system).
- Decouple movement logic from pieces themselves. The current system requires passing a reference of the game board to a piecesFactory method. This allows creating pieces that have movement logic on themselves, but requires knowledge of the game board. This has proven to be a cumbersome and inelegant solution. Moving the logic outside the pieces themselves should allow for a cleaner board and clearer logic.
- Combine this chess app with a previous checkers app I created and allow players to select either kind of game.

### What I Have Learned <a name="learnings" />

This project has taught me quite a bit. This was my first truly independent project (no tutorial or other structure), and I have ran into many issues (read: educational moments) while making it. 

- As noted above I learned an important lesson on separation of concerns/decoupling. However, there is an even better example. Originally, I stored both the location of game pieces and the properties of the squares making up the game board on the same data structure. This led to several issues, such as unnecessarily complicating error messages, AI needing to process much more information than necessary, having to send larger amounts of data through socket.io, and there would likely be even more issues had I not decoupled the two. Amateur mistake, I know, but lesson learned.

- The app has allowed me to practice several things.
- - A tenant of functional programming is to try and make methods responsible for only one thing. This will ideally make code more self-documenting and easier to debug. I have tried to follow this principle throughout the project.

- - Testing is an area that I have not had a huge degree of experience with in the past. On this app I finally took the plunge and started learning how to incorporate them. Test driven development promises to create a stable foundation for extending a code base and help catch breaking errors quickly. While I haven't as yet started writing tests for new features, I have embraced the principles of such an approach and hope to start using it once I have written appropriate tests for the code I have already written.

- - Designing an AI (even as basic as the ones used here) was an interesting introduction to how AIs think and the data structures used to implement them.

- - Practicing designing a system within an M-V-C pattern was also educational.

### Thank You <a name="thanks" />

If you have gotten this far down the Readme, thank you for your interest! I am just beginning my coding journey and as such there are likely many things I did inefficiently, or perhaps there are anti-patterns I used that I was unaware were not recommended, or my comment style could be better, etc. If so, please let me know a better way. My pride can take it.

Also if you are new to coding as well, I hope that my code can help you in some way.
