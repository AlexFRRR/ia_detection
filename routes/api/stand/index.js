const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const MongoDBConnection = require("../../../services/database");

const upload = multer({ storage: multer.memoryStorage() });

// @route   get route
// @desc    get stands
// @access  private access
router.get("/", async (req, res) => {
  // chercher les info du user à partir du cookie d'auth
  const user = {
    _id: "user_id",
  };

  try {
    const connection = new MongoDBConnection();
    await connection.connect();
    const db = connection.getDatabase("VisIT");

    const result = db.collection("layout").findOne();
    result
      .then((document) => {
        console.log("Résultat :", document.stands);
        document.stands.map((row, i) => {
          row.map((stand, j) => {
            console.log("MP", stand.exponentId);
            if (stand.exponentId === user._id) {
              const imageNames = fs.readdirSync(
                `public/images/stand_${i}_${j}`
              );
              stand.urlImage1 =
                process.env.APP_URL +
                `/images/stand_${i}_${j}/${imageNames[0]}`;
              stand.urlImage2 =
                process.env.APP_URL +
                `/images/stand_${i}_${j}/${imageNames[1]}`;
              return stand;
            } else {
              return {
                taken: stand.exponentId !== undefined,
              };
            }
          });
        });
        return res.json({
          stands: document.stands,
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des documents :", error);
      });
  } catch (error) {}
});

// @route   post route
// @desc    add new stand
// @access  private access
router.post(
  "/add",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  async (req, res, next) => {
    try {
      const connection = new MongoDBConnection();
      await connection.connect();
      const db = connection.getDatabase("VisIT");

      // Décider du nom des images dans la fonction de gestion de la route
      const image1 = req.files["image1"][0];
      const image2 = req.files["image2"][0];

      const uploadsDir = `public/images/stand_${req.body.row}_${req.body.column}/`;
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      console.log("pb", path.extname(image1.originalname));

      fs.writeFileSync(
        uploadsDir + "image_1" + path.extname(image1.originalname),
        req.files["image1"][0].buffer
      );
      fs.writeFileSync(
        uploadsDir + "image_2" + path.extname(image2.originalname),
        req.files["image2"][0].buffer
      );

      const update = { $set: {} };
      update.$set[`stands.${req.body.row}.${req.body.column}`] = {
        exponentId: "user_id",
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

router.get("/init", async (req, res) => {
  try {
    const connection = new MongoDBConnection();
    await connection.connect();
    const db = connection.getDatabase("VisIT");

    const stands = Array.from({ length: 12 }, () => Array(6).fill({}));

    const result = await db
      .collection("layout")
      .updateOne({}, { $set: { stands: stands } });

    const imagesPath = "public/images";

    const folderNames = fs
      .readdirSync(imagesPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Delete folders
    folderNames.forEach((folderName) => {
      const folderPath = path.join(imagesPath, folderName);
      fs.rmdirSync(folderPath, { recursive: true });
    });

    return res.json({ message: "success" });
  } catch (error) {
    console.log("r", error);
    res.status(500).json({
      message: error,
    });
  }
});

module.exports = router;
