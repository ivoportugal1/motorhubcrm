const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const unidadesController = require('../controllers/unidadesController');

router.get('/', auth, unidadesController.getUnidades);
router.post('/', auth, unidadesController.createUnidade);
router.put('/:id', auth, unidadesController.updateUnidade);
router.delete('/:id', auth, unidadesController.deleteUnidade);

module.exports = router;
