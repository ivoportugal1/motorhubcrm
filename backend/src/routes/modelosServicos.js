const express = require('express');
const auth = require('../middleware/auth');
const modelosController = require('../controllers/modelosServicosController');

const router = express.Router();

router.get('/', auth, modelosController.getModelos);
router.post('/', auth, modelosController.createModelo);
router.put('/:id', auth, modelosController.updateModelo);
router.delete('/:id', auth, modelosController.deleteModelo);

module.exports = router;
