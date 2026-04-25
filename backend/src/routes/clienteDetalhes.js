const express = require('express');
const auth = require('../middleware/auth');
const clienteDetalhesController = require('../controllers/clienteDetalhesController');

const router = express.Router();

router.get('/:id', auth, clienteDetalhesController.getCliente);
router.get('/:id/historico', auth, clienteDetalhesController.getHistorico);

module.exports = router;
