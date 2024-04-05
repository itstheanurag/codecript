const express = require("express");
const app = express();

const users = [];

app.use(express.json());
app.post("/api/users", (req, res) => {
  const user = req.body;
  console.log(user);
  users.push(user);
  // do something with user data
  res.send("User created successfully");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
