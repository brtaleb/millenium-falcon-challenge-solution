const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/', controller.getUploadForm);

router.get('/odds', controller.getOdds);

router.post('/upload', controller.uploadForm);

module.exports = router;
