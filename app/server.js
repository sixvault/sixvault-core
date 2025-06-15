const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    cors({
        origin: [
            "http://localhost:80",
            "http://localhost:8080",
            "http://localhost:3000",
            "http://localhost:4173",
            "http://localhost:5173",
            "https://sixvault.xyz",
            "https://api.sixvault.xyz",
        ],
        credentials: true,
    }),
);

const verifyAccessToken = require("./utils/auth/jwt/verify");

const userRouter = require("./domains/users/user.router");
app.use("/user", userRouter);

const studentRouter = require("./domains/student/student.router");
app.use("/student", studentRouter);

const mkRouter = require("./domains/matakuliah/matakuliah.router");
app.use("/matakuliah", mkRouter);

const nilaiRouter = require("./domains/nilai/nilai.router");
app.use("/nilai", nilaiRouter);

const transcriptRouter = require("./domains/transcript/transcript.router");
app.use("/transcript", transcriptRouter);

const kaprodiRouter = require("./domains/kaprodi/kaprodi.router");
app.use("/kaprodi", kaprodiRouter);

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "templates/pages/index.html"));
});

module.exports = app;
