const express = require('express')
const app = express();

app.get("/", (req, res) => {
    res.json({ msg: "hello from server" });
});

app.listen(5002, () => {
    console.log("server running on port 5002");
});

app.get("/api", (req, res) => {
    res.json({"users": ["user1", "user2"]});
});

app.get("/organisateur", (req, res) => {
    res.json({"Acces Orga": "orga1"});
});

app.get("/visiteur", (req, res) => {
    res.json({"Acces visiteur": "visiteur1"});
});
