'use strict';

var _ = require('lodash');
var Square = require('./square.model');

// Get list of squares
exports.index = function(req, res) {
  Square.find(function (err, squares) {
    if(err) { return handleError(res, err); }
    return res.json(200, squares);
  });
};

// Get a single square
exports.show = function(req, res) {
  Square.findById(req.params.id, function (err, square) {
    if(err) { return handleError(res, err); }
    if(!square) { return res.send(404); }
    return res.json(square);
  });
};

// Creates a new square in the DB.
exports.create = function(req, res) {
  Square.create(req.body, function(err, square) {
    if(err) { return handleError(res, err); }
    return res.json(201, square);
  });
};

// Updates an existing square in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Square.findById(req.params.id, function (err, square) {
    if (err) { return handleError(res, err); }
    if(!square) { return res.send(404); }
    var updated = _.merge(square, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, square);
    });
  });
};

// Deletes a square from the DB.
exports.destroy = function(req, res) {
  Square.findById(req.params.id, function (err, square) {
    if(err) { return handleError(res, err); }
    if(!square) { return res.send(404); }
    square.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}