const path = require("path");

const express = require("express");
const morgan = require("morgan");
const moongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

require("dotenv").config();
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@dev-cluster.gmixj.mongodb.net/devshowcase?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "session",
});

const indexRoute = require("./routes/index");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(indexRoute);
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

moongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((client) => {
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
