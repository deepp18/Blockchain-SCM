const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const filePath = "./users.json";

// 🔥 READ USERS
const getUsers = () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// 🔥 SAVE USERS
const saveUsers = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

// 🔐 SIGNUP
app.post("/signup", (req, res) => {
  const users = getUsers();

  const existingUser = users.find(
    (u) => u.email === req.body.email
  );

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push(req.body);
  saveUsers(users);

  res.json({ message: "User registered" });
});

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const users = getUsers();

  const user = users.find(
    (u) =>
      u.email === req.body.email &&
      u.password === req.body.password
  );

  if (user) {
    res.json(user);
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));