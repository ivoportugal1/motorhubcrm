const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/transferenciaController');

router.get('/',       auth, c.listar);
router.post('/',      auth, c.criar);
router.delete('/:id', auth, c.deletar);

module.exports = router;
