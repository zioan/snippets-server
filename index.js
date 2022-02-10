const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

//setup express server
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://snippet-manager-test.netlify.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 5000; //for herocu
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

//set up routers
app.use("/snippet", require("./routers/snippetRouter")); //http://localhost:5000/snippet/
app.use("/auth", require("./routers/userRouter")); //http://localhost:5000/auth/

//connect to mongoDB

mongoose.connect(process.env.MDB_CONNECT_STRING, (err) => {
  if (err) return console.error(err);
  console.log("Connected to MongoDB");
});
