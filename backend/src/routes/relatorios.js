const express = require('express');
const auth = require('../middleware/auth');
const relatorioController = require('../controllers/relatorioController');

const router = express.Router();

router.get('/', auth, relatorioController.getRelatorios);

module.exports = router;
