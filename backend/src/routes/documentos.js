const express = require('express');
const auth = require('../middleware/auth');
const documentosController = require('../controllers/documentosController');

const router = express.Router();

router.get('/orcamento/:id/pdf', auth, documentosController.getOrcamento);
router.get('/relatorio/excel', auth, documentosController.getRelatorioExcel);
router.get('/relatorio/pdf', auth, documentosController.getRelatorioPDF);

module.exports = router;
