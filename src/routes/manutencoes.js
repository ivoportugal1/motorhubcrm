const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/manutencaoController');

router.get('/alertas', auth, c.alertas);
router.get('/',        auth, c.listar);
router.post('/',       auth, c.criar);
router.put('/:id',     auth, c.atualizar);
router.delete('/:id',  auth, c.deletar);

module.exports = router;
