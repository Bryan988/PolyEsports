let express = require('express');
let router = express.Router();
let users = require('../controllers/usersController');
let games = require('../controllers/gamesController');
let tournament = require('../controllers/tournamentController');

router.get('/',users.verifyAdmin,users.adminPage);

router.get('/games/add',users.verifyAdmin,games.addGamePage);
router.post('/games/add',users.verifyAdmin,games.addGame);

router.get('/games/delete',users.verifyAdmin,games.deleteGamePage);
router.post('/games/delete',users.verifyAdmin,games.deleteGame);

router.get('/tournament/create',users.verifyAdmin,tournament.addTournamentPage);
router.post('/tournament/create',users.verifyAdmin,tournament.addTournament);


module.exports=router;