const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const port = process.env.PORT;
const uri = process.env.MONGO_URI;

const {exposantSchema, visiteurSchema} = require("./schema_requete");

const express = require("express");
const app = express();


/* ----------------------------------------------- Gestion du serveur ----------------------------------------------- */

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Procédure du lancement et de l'arret du serveur
async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ping: 1});
        console.log("Vous êtes bien connecté à MongoDB!");

       // Démarrage du serveur Express après MongoDB
        const server = app.listen(port, () => {
            console.log(`Le serveur fonctionne sur le port: ${port}`);
        });

        // Fonction d'arret
        const shutdown = () => {
            console.log("Fermeture de la session MongoDB...");
            client.close().then(() => {
                console.log("MongoDB: connection fermé.");
                console.log("Arrêt en cours...");
                server.close(() => {
                    console.log("Serveur: Eteint.");
                    process.exit(0);
                });
            }).catch((err) => {
                console.error("Erreur durant la fermeture du serveur:", err);
                process.exit(1);
            });
        };

        // Gestion des évènements (ex: "CTRL+C")
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error) {
        console.error("Erreur lors de la connection à MongoDB:", error);
        process.exit(1);
    }
}

run().catch(console.dir);

/* ----------------------------------------------- Gestion des routes ----------------------------------------------- */

app.use(express.json({type: "application/json"}));

app.get("/api/exposant", async (req, res, next) => {
    try {
        // Effectuez une requête à la base de données pour récupérer les exposants
        const exposants = await client.db("VisIT").collection("exposant").find().toArray();

        // Renvoyer les exposants en tant que réponse
        res.json(exposants);
    } catch (error) {
        next(error);
    }
});

app.get("/api/visiteur", async (req, res, next) => {
    try {
        // Effectuez une requête à la base de données pour récupérer les visiteurs
        const visiteurs = await client.db("VisIT").collection("visiteur").find().toArray();

        // Renvoyer les visiteurs en tant que réponse
        res.json(visiteurs);
    } catch (error) {
        next(error);
    }
});

app.get("/api/stand", async (req, res, next) => {
    try {
        // Effectuez une requête à la base de données pour récupérer les stands
        const stands = await client.db("VisIT").collection("stand").find().toArray();

        // Renvoyer les stands en tant que réponse
        res.json(stands);
    } catch (error) {
        next(error);
    }
});

app.post("/api/exposant/add", async (req, res, next) => {
    try {
        const data = req.body;

        // Valider les données avec Joi
        const {error, value} = exposantSchema.validate(data);

        // Si les données ne sont pas valides, renvoyer une erreur
        if (error) {
            res.status(400).send(error.details[0].message);
            return;
        } else {
            // Si les données sont valides, procéder à l'insertion
            delete value._id;

            const result = await client.db("VisIT").collection("exposant").insertOne(value);
            res.status(200).send("Données pour exposant enregistrées avec succès");
        }
    } catch (error) {
        next(error);
    }
});

app.post("/api/visiteur/add", async (req, res, next) => {
    try {
        const data = req.body;

        // Valider les données avec Joi
        const {error, value} = visiteurSchema.validate(data);

        // Si les données ne sont pas valides, renvoyer une erreur
        if (error) {
            res.status(400).send(error.details[0].message);
            return;
        } else {
            // Si les données sont valides, procéder à l'insertion
            if (data._id) {
                delete data._id;
            }

            const result = await client.db("VisIT").collection("visiteur").insertOne(value);
            res.status(200).send("Données pour visiteur enregistrées avec succès");
        }
    } catch (error) {
        next(error);
    }
});

app.post("/api/stand/add", async (req, res, next) => {
    try {
        const data = req.body;

        if (data._id) {
            delete data._id;
        }

        const result = await client.db("VisIT").collection("stand").insertOne(data);
        res.status(200).send("Données du stand enregistrées avec succès");
    } catch (error) {
        next(error);
    }
});

app.put("/api/visiteur/update/:id", async (req, res, next) => {
    const documentId = req.params.id;
    const updatedData = req.body;

    try {
        // Validation des données
        const {error, value} = visiteurSchema.validate(updatedData);

        // Si les données ne sont pas valides, renvoyer une erreur
        if (error) {
            res.status(400).send(error.details[0].message);
        } else {
            // Si les données sont valides, procéder à la mise à jour

            const result = await client.db("VisIT").collection("visiteur").updateOne({_id: new ObjectId(documentId)}, {$set: value});

            // Vérifie si la mise à jour a été effectuée avec succès
            if (result.modifiedCount === 1) {
                res.status(200).json({message: "Document mis à jour avec succès"});
            } else {
                res.status(404).json({message: "Document non trouvé"});
            }
        }
    } catch (error) {
        next(error);
    }
});

app.delete("/api/visiteur/delete/:id", async (req, res, next) => {
    const documentId = req.params.id;

    try {
        // Suppression du document
        const result = await client.db("VisIT").collection("visiteur").deleteOne({_id: new ObjectId(documentId)});

        // Vérifie si la suppression a été effectuée avec succès
        if (result.deletedCount === 1) {
            res.status(200).json({message: "Utilisateur supprimé avec succès."});
        } else {
            res.status(404).json({message: "Utilisateur introuvable."});
        }
    } catch (error) {
        next(error);
    }
});


/* ---------------------------------------------- Gestion des erreurs ----------------------------------------------- */

// Evite le crash du serveur si une erreur survient
app.use((err, req, res, next) => {
    if (err && err.error && err.error.isJoi) {
        res.status(400).json({
            type: err.type,
            message: err.error.toString(),
        });
    } else {
        res.status(500).json({message: "Une erreur est survenue sur le serveur."});
    }
});

process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at:", p, 'reason:', reason);
    shutdown();
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception thrown:", err);
    shutdown();
});
