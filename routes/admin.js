let express = require('express');
let router = express.Router();
let games = require('../controllers/gamesController');
let tournament = require('../controllers/tournamentController');
let services = require('../middlewares/userMW');
let users = require('../controllers/usersController');


router.get('/',services.verifyAdmin,users.adminPage);

router.get('/games/add',services.verifyAdmin,games.addGamePage);
router.post('/games/add',services.verifyAdmin,games.addGame);

router.get('/games/delete',services.verifyAdmin,games.deleteGamePage);
router.get('/games/delete/:id',services.verifyAdmin,games.deleteGame);

router.get('/tournament/create',services.verifyAdmin,tournament.addTournamentPage);
router.post('/tournament/create',services.verifyAdmin,tournament.addTournament);

router.get('/tournament/edit',services.verifyAdmin,tournament.selectTournamentPage);
router.get('/tournament/delete/:id',services.verifyAdmin,tournament.deleteTournament);

router.get('/tournament/update/:id',services.verifyAdmin,tournament.updateTournamentPage);
router.post('/tournament/update/:id',services.verifyAdmin,tournament.updateTournament);



module.exports=router;