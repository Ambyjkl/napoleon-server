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
        socket.emit("action", {
            type: "STATUS",
            data: game.fetchData(name)
        });
    }
};
const io = require("socket.io").listen(server);
io.sockets.on("connection", (socket) => {
    console.log("We have a new player! " + socket.id);
    socket.on("action", (action) => {
        switch (action.type) {
            case "s/ready": {
                players.add(socket, action.data.name);
                socket.broadcast.emit("action", {
                    type: "ADD_PLAYER",
                    data: action.data.name
                });
                break;
            }
            case "s/start": {
                newGame = new Game(players.values());
                io.emit("action", { type: "PREPARE_GAME", data: "gg" });
                syncStatus(newGame);
                break;
            }
            case "s/move": {
                newGame.turn(action.data);
                syncStatus(newGame);
            }
        }
    });
    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");
    });
});
