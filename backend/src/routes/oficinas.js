const express = require('express');
const auth = require('../middleware/auth');
const oficinasController = require('../controllers/oficinasController');

const router = express.Router();

router.get('/config', auth, oficinasController.getConfig);
router.put('/config', auth, oficinasController.updateConfig);

module.exports = router;
