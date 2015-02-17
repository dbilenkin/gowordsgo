/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Tile = require('./tile.model');

exports.register = function(socket) {
  Tile.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Tile.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('tile:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('tile:remove', doc);
}