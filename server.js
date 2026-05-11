const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Static folder
app.use(express.static("public"));

// API endpoint to send Google Maps API key
app.get("/api/config", (req, res) => {
  res.json({ apiKey: process.env.MAP_API_KEY });
});

let users = {};

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join", (data) => {
        users[socket.id] = {
            name: data.name,
            lat: null,
            lng: null
        };

        io.emit("users-update", users);
    });

    socket.on("send-location", (coords) => {
        if (users[socket.id]) {
            users[socket.id].lat = coords.lat;
            users[socket.id].lng = coords.lng;
        }

        io.emit("users-update", users);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        delete users[socket.id];
        io.emit("users-update", users);
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});