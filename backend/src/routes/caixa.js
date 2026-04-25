const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/caixaController');

router.get('/atual',         auth, c.caixaAtual);
router.get('/historico',     auth, c.historico);
router.post('/abrir',        auth, c.abrir);
router.post('/fechar',       auth, c.fechar);
router.post('/movimentos',   auth, c.addMovimento);
router.delete('/movimentos/:id', auth, c.delMovimento);

module.exports = router;
