const express = require('express');
let router = express.Router();
let teams = require('../controllers/teamsController');
let middleware = require('../middlewares/userMW');

router.get("/", teams.allTeamsPage);

router.get("/create",middleware.checkLogged,middleware.canCreateTeam,teams.createTeamPage);
router.post("/create",middleware.checkLogged,teams.createTeam);

router.get("/:id",teams.profilePage);
router.post("/:id",teams.requestFromPage);
router.put("/:id",teams.requestFromPage);
router.delete("/:id",teams.requestFromPage);

module.exports = router;
