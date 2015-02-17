'use strict';

var _ = require('lodash');
var Tile = require('./tile.model');

// Get list of tiles
exports.index = function(req, res) {
  Tile.find(function (err, tiles) {
    if(err) { return handleError(res, err); }
    return res.json(200, tiles);
  });
};

// Get a single tile
exports.show = function(req, res) {
  Tile.findById(req.params.id, function (err, tile) {
    if(err) { return handleError(res, err); }
    if(!tile) { return res.send(404); }
    return res.json(tile);
  });
};

// Creates a new tile in the DB.
exports.create = function(req, res) {
  Tile.create(req.body, function(err, tile) {
    if(err) { return handleError(res, err); }
    return res.json(201, tile);
  });
};

// Updates an existing tile in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Tile.findById(req.params.id, function (err, tile) {
    if (err) { return handleError(res, err); }
    if(!tile) { return res.send(404); }
    var updated = _.merge(tile, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, tile);
    });
  });
};

// Deletes a tile from the DB.
exports.destroy = function(req, res) {
  Tile.findById(req.params.id, function (err, tile) {
    if(err) { return handleError(res, err); }
    if(!tile) { return res.send(404); }
    tile.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}