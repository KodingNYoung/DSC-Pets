const express = require("express");

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

app.post("/upload", (req, res) => {
  console.log("request recieved!");

  res.json({ images: req.body });
  console.log("response sent!");
});

app.listen(3000, () => {
  console.log("listening a port 3000");
});
