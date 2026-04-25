const express = require('express');
const auth = require('../middleware/auth');
const usuariosController = require('../controllers/usuariosController');

const router = express.Router();

router.get('/', auth, usuariosController.getUsuarios);
router.post('/', auth, usuariosController.createUsuario);
router.put('/:id', auth, usuariosController.updateUsuario);
router.delete('/:id', auth, usuariosController.deleteUsuario);

module.exports = router;
