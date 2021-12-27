const path = require("path");

const express = require("express");
const morgan = require("morgan");
const moongoose = require("mongoose");

require("dotenv").config();

const app = express();

const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/auth", authRoutes);
app.use("/", errorController.get404);

//err handler
app.use((err, req, res, next) => {
  try {
    const { message, statusCode } = err;
    if (statusCode && message) {
      return res.status(statusCode).json({ message: message });
    }
    res.status(500).json({ message: message });
  } catch (err) {
    console.log(err);
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@dev-cluster.gmixj.mongodb.net/devshowcase?retryWrites=true&w=majority`;

moongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((client) => {
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
