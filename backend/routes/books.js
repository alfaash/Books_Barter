const express = require("express");
const { getBook, getAllBooks, postBook, postImage } = require("../controllers/books");
const authentication=require("../middleware/authentication");

module.exports = (upload) => {
  const router = express.Router();

  router.route("/").get(getAllBooks).post(authentication,upload.single("photo"), postBook); // ✅ multer memory storage

  router.route("/:id").get(getBook);
  router.route("/image/:filename").get(postImage);

  return router;
};
