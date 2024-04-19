import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("server started at ", port));

app.get("/callback", (req, res) => {
  console.log("callback get request");
  res.send("callback url working");
});

app.post("/callback", (req, res) => {
  console.log("================= callback post request data =================");
  console.log(req.body);
  console.log("================= callback post request end =================");
  res.send("callback url working");
});
