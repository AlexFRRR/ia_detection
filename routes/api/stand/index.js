const express = require("express");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// @route   get get route
// @desc    add new stand
// @access  public access
router.post(
  "/",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  async (req, res, next) => {
    console.log("hello");

    async (req, res, next) => {
      try {
        // Les images sont maintenant enregistrées dans le dossier 'uploads'
        const image1Path = req.files["image1"][0].path;
        const image2Path = req.files["image2"][0].path;

        // Récupérer les autres champs du formulaire
        const titre = req.body.titre;
        const description = req.body.description;

        // Traitez les données du formulaire et enregistrez-les dans la base de données
        // ...

        return res.json({ message: "Stand ajouté avec succès" });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "Erreur lors de l'ajout du stand" });
      }
    };
  }
);

module.exports = router;
