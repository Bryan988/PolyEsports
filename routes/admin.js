let express = require('express');
let router = express.Router();
let users = require('../controllers/usersController');
let games = require('../controllers/gamesController');

router.get('/',users.verifyAdmin,users.adminPage);

router.get('/games/add',users.verifyAdmin,games.addGamePage);
router.post('/games/add',users.verifyAdmin,games.addGame);

router.get('/games/delete',users.verifyAdmin,games.deleteGamePage);
router.delete('/games/delete',games.deleteGame,games.deleteGamePage);


module.exports=router;