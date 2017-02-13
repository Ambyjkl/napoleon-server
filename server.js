const express = require("express");
const app = express();
const PORT = 1808;
const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

import Game from "./Game";

let players = new Map;
let newGame;
const syncStatus = (game) => {
    for (let [socket, name] of players) {
        console.log(name);
        socket.emit("action", {
            type: "UPDATE_STATUS",
            data: game.fetchData(name)
        });
        socket.emit("action", {
            type: "RESET_LOCAL_STATE"
        });
    }
};
const io = require("socket.io").listen(server);
io.sockets.on("connection", (socket) => {
    console.log("We have a new player! " + socket.id);
    let alreadyStarted = false;
    socket.on("action", (action) => {
        switch (action.type) {
            case "s/ready": {
                players.set(socket, action.data);
                socket.broadcast.emit("action", {
                    type: "ADD_PLAYER",
                    data: action.data
                });
                break;
            }
            case "s/start": {
                if (!alreadyStarted) {
                    alreadyStarted = true;
                    newGame = new Game(Array.from(players.values()));
                    io.emit("action", {
                        type: "PREPARE_GAME",
                        data: action.data
                    });
                    syncStatus(newGame);
                }
                break;
            }
            case "s/move": {
                const result = newGame.turn(action.data);
                if (result === false) {
                    socket.emit("action", {
                        type: "DETECTED_CHEATING",
                    });
                }
                syncStatus(newGame);
                break;
            }
            case "s/message": {
                io.emit("action", {
                    type: "NEW_MESSAGE",
                    data: action.data
                });
            }
        }
    });
    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");
    });
});
// let ng = new Game(["a", "b"]);
// ng.fetchData
// ng.turn({
//     source: "a"
// })