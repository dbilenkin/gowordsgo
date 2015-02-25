/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Square = require('./square.model');

exports.register = function(socket) {
  Square.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Square.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('square:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('square:remove', doc);
}