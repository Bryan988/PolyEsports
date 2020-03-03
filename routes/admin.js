let express = require('express');
let router = express.Router();
let games = require('../controllers/gamesController');
let tournament = require('../controllers/tournamentController');
let matches = require("../controllers/matchesController");
let services = require('../middlewares/userMW');
let users = require('../controllers/usersController');


router.get('/',services.verifyAdmin,users.adminPage);

router.get('/games/add',services.verifyAdmin,games.addGamePage);
router.post('/games/add',services.verifyAdmin,games.addGame);

router.get('/games/delete',services.verifyAdmin,games.deleteGamePage);
router.delete('/games/delete/',services.verifyAdmin,games.deleteGame);

router.get('/tournament/create',services.verifyAdmin,tournament.addTournamentPage);
router.post('/tournament/create',services.verifyAdmin,tournament.addTournament);

router.get('/tournament/edit',services.verifyAdmin,tournament.selectTournamentPage);
router.delete('/tournament/edit',services.verifyAdmin,tournament.deleteTournament);

router.get('/tournament/update/:id',services.verifyAdmin,tournament.updateTournamentPage);
router.put('/tournament/update/:id',services.verifyAdmin,tournament.updateTournament);

router.get('/tournament/:id/matches/create',services.verifyAdmin,matches.addMatchPage);
router.post('/tournament/:id/matches/create',services.verifyAdmin,matches.addMatch);

router.get('/tournament/:id/matches/',services.verifyAdmin,matches.allMatches);
router.delete('/tournament/:id/matches/',services.verifyAdmin,matches.deleteMatch);

router.get('/tournament/:id/matches/update/:idmatch',services.verifyAdmin,matches.updateMatchPage);
router.put('/tournament/:id/matches/update/:idmatch',services.verifyAdmin,matches.updateMatch);

module.exports=router;