const express = require('express');
const auth = require('../middleware/auth');
const alertasController = require('../controllers/alertasController');

const router = express.Router();

router.get('/', auth, alertasController.getAlertas);
router.get('/count', auth, alertasController.getContagemAlertas);

module.exports = router;
