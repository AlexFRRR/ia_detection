const express = require("express");
const multer = require("multer");
const router = express.Router();
const MongoDBConnection = require("../../../services/database");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// @route   post route
// @desc    add new stand
// @access  public access
router.post(
  "/",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  async (req, res, next) => {
    try {
      const connection = new MongoDBConnection();
      await connection.connect();

      const db = connection.getDatabase("VisIT");

      const update = { $set: {} };
      update.$set[`stands.${req.body.row}.${req.body.column}`] = {
        title: req.body.title,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
      };

      try {
        const dbOperationResult = await db
          .collection("layout")
          .updateOne({}, update);
        console.log("result", dbOperationResult);
        return res.json({ msg: "stand created succesfully" });
      } catch (error) {
        console.log("Error when asking mongodb");
      }

      // Les images sont maintenant enregistrées dans le dossier 'uploads'
      const image1Path = req.files["image1"][0].path;
      const image2Path = req.files["image2"][0].path;
    } catch (error) {
      console.error("error", error);
      return res
        .status(500)
        .json({ message: "Erreur lors de l'ajout du stand" });
    }
  }
);

module.exports = router;
