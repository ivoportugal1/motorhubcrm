const express = require('express');
const auth = require('../middleware/auth');
const integracaoController = require('../controllers/integracaoController');

const router = express.Router();

router.get('/config', auth, integracaoController.getConfig);
router.put('/config', auth, integracaoController.updateConfig);
router.post('/whatsapp/teste', auth, integracaoController.testarWhatsApp);
router.post('/whatsapp/enviar-orcamento', auth, integracaoController.enviarOrcamentoWhatsApp);

module.exports = router;
