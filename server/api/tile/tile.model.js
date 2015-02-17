'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TileSchema = new Schema({
  content: String,
  sizeX: Number,
  sizeY: Number,
  row: Number,
  col: Number
});

module.exports = mongoose.model('Tile', TileSchema);