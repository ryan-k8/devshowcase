const { storage } = require("../util/cloudinary");
const multer = require("multer");

module.exports = multer({ storage });
