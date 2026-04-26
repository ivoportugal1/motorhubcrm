const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/pecaController');

router.get('/',                    auth, c.listar);
router.get('/produtos-vendidos',   auth, c.produtosVendidos);
router.post('/',                   auth, c.criar);
router.put('/:id',                 auth, c.atualizar);
router.delete('/:id',              auth, c.deletar);
router.patch('/:id/estoque',       auth, c.ajustarEstoque);

module.exports = router;
