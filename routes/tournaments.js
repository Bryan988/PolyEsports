const express = require('express');
let router = express.Router();
let middleware = require('../middlewares/userMW');
let tournaments = require("../controllers/tournamentController");
let services = require("../services/commonServices");

router.get("/",tournaments.allTournaments);

router.get("/:id",tournaments.tournamentPage);
router.post("/:id",tournaments.tournament);



module.exports = router;
