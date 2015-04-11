'use strict';

var express = require('express');
var controller = require('./game.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.put('/:id/board', controller.updateBoard);
router.put('/:id/swapTiles', controller.swapTiles);
router.put('/:id/getNewTiles', controller.getNewTiles);
router.put('/:id/leftoverTiles', controller.leftoverTiles);



module.exports = router;