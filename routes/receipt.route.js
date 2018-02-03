const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const passport = require('passport');
const secure = require('../configs/passport.config');

router.get('/', receiptController.show);
router.get('/:id', receiptController.showOne);

router.get('/create', receiptController.create);
router.post('/create', receiptController.doCreate);

router.get('/edit/:id', receiptController.edit);
router.post('/edit/:id', receiptController.doEdit);

router.post('/delete/:id', receiptController.doDelete);


module.exports = router;