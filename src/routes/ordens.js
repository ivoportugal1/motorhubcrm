const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/ordemController');

router.get('/dashboard', auth, c.dashboard);
router.get('/', auth, c.listar);
router.get('/:id', auth, c.buscarPorId);
router.post('/', auth, c.criar);
router.put('/:id', auth, c.atualizar);
router.patch('/:id/status', auth, c.atualizarStatus);

module.exports = router;
