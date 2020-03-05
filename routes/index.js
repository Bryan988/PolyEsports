var express = require('express');
var router = express.Router();
let index = require('../controllers/indexController');
let middlewares = require('../middlewares/userMW');

/* GET home page. */
router.get('/',index.homePage);

module.exports = router;


router.get('/verify',middlewares.checkNonLogged,index.verifyPage);
router.put('/verify',middlewares.checkNonLogged,index.verify);

//TODO faire redirection apres le login si pas verifié
