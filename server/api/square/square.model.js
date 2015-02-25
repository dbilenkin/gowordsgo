'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SquareSchema = new Schema({
  tile: String,
  row: Number,
  col: Number
});

module.exports = mongoose.model('Square', SquareSchema);