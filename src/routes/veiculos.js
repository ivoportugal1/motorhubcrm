const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/veiculoController');

router.get('/',     auth, c.listar);
router.get('/:id',  auth, c.buscarPorId);
router.post('/',    auth, c.criar);
router.put('/:id',  auth, c.atualizar);
router.delete('/:id', auth, c.deletar);

module.exports = router;
