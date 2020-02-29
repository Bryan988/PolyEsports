const express = require('express');
let router = express.Router();
let games = require('../controllers/gamesController');
let teams = require('../controllers/teamsController');
let middleware = require('../middlewares/userMW');
let users = require('../controllers/usersController');



router.get("/create",middleware.checkLogged,middleware.canCreateTeam,teams.createTeamPage);
router.post("/create",middleware.checkLogged,teams.createTeam);

router.get("/:id",teams.profilePage);
router.post("/:id",teams.requestFromPage);

router.get("/", teams.allTeamsPage);









module.exports = router;
