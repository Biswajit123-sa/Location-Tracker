const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Static folder
app.use(express.static("public"));

// Store users
let users = {};

// Socket connection
io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // When user joins
    socket.on("join", (data) => {
        users[socket.id] = {
            name: data.name,
            lat: null,
            lng: null
        };

        io.emit("users-update", users);
    });

    // When location sent
    socket.on("send-location", (coords) => {
        if (users[socket.id]) {
            users[socket.id].lat = coords.lat;
            users[socket.id].lng = coords.lng;
        }

        io.emit("users-update", users);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        delete users[socket.id];
        io.emit("users-update", users);
    });

});

// Start server
const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});