'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GameSchema = new Schema({
  board: [],
  bag: [],
  players: [],
  scores: [],
  active: Boolean
});

module.exports = mongoose.model('Game', GameSchema);