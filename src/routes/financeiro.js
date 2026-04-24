const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/financeiroController');

router.get('/resumo', auth, c.resumo);
router.get('/',       auth, c.listar);
router.post('/',      auth, c.criar);
router.put('/:id',    auth, c.atualizar);
router.patch('/:id/pagar', auth, c.pagar);
router.delete('/:id', auth, c.deletar);

module.exports = router;
