'use strict';

var _ = require('lodash');
var Game = require('./game.model');

// Get list of games
exports.index = function(req, res) {
	Game.find(function(err, games) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(200, games);
	});
};

// Get a single game
exports.show = function(req, res) {
	Game.findById(req.params.id, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		if (!game) {
			return res.send(404);
		}
		return res.json(game);
	});
};

// Creates a new game in the DB.
exports.create = function(req, res) {
	Game.create(req.body, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(201, game);
	});
};

// Updates an existing game in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Game.findById(req.params.id, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		if (!game) {
			return res.send(404);
		}
		var updated = _.extend(game, req.body);
		updated.markModified('board');
		updated.markModified('bag');
		updated.markModified('players');
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, game);
		});
	});
};

// Swap out all tiles
exports.swapTiles = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Game.findById(req.params.id, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		if (!game) {
			return res.send(404);
		}
		
		var newLetters = [];
		var oldTiles = req.body;
		
		for (var i = 0; i < oldTiles.length; i++) {
			newLetters.push(getLetter(game.bag));
		}
		
		for (var i = 0; i < oldTiles.length; i++) {
			game.bag.push(oldTiles[i].letter);
		}
		
		game.version++;
		
		game.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, { game: game, letters: newLetters });
		});
		
	});
};


// Get tiles for when game starts
exports.getNewTiles = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Game.findById(req.params.id, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		if (!game) {
			return res.send(404);
		}
		
		var newLetters = [];

		for (var i = 0; i < 7; i++) {
			newLetters.push(getLetter(game.bag));
		}
		
		game.version++;
		
		game.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, { game: game, letters: newLetters });
		});

	});
};

// Updates an existing board in the DB.
exports.updateBoard = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Game.findById(req.params.id, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		if (!game) {
			return res.send(404);
		}
		
		var clientVersion = req.body.gameVersion;
		var updatedBy = req.body.updatedBy;
		var score = req.body.score;

		

		var placedTiles = req.body.placedTiles;
		var conflict = false;
		for (var i = 0; i < placedTiles.length; i++) {
			if (game.board[placedTiles[i].row][placedTiles[i].col][0]) {
				conflict = true;
				break;
			}
		}

		if (!conflict) {
			
			var newLetters = [];
			
			if (clientVersion != game.version) {
				return res.json(200, "outdated");
			}
			
			for (var i = 0; i < placedTiles.length; i++) {
				game.board[placedTiles[i].row][placedTiles[i].col][0] = placedTiles[i];
				newLetters.push(getLetter(game.bag));
			}
			
			game.players[updatedBy].score += score;
			game.version++;
			game.updatedBy = updatedBy;

			Game.update({
				_id : game._id,
				version : clientVersion
			}, {
				version : game.version,
				updatedBy : game.updatedBy,
				board : game.board,
				bag : game.bag,
				players : game.players
			}, {
				multi : false
			}, function(err, numberAffected, raw) {
				if (err)
					return handleError(err);
				if (numberAffected == 0) {
					return res.json(200, "outdated");
				}
				game.save(function(err) {
					if (err) {
						return handleError(res, err);
					}
					return res.json(200, { game: game, letters: newLetters });
				});
			});

		} else {
			return res.json(200, "conflict");
		}

	});
};

// Updates an existing game in the DB.
exports.updateBag = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Game.findById(req.params.id, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		if (!game) {
			return res.send(404);
		}
		var updated = _.merge(game, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, game);
		});
	});
};

// Deletes a game from the DB.
exports.destroy = function(req, res) {
	Game.findById(req.params.id, function(err, game) {
		if (err) {
			return handleError(res, err);
		}
		if (!game) {
			return res.send(404);
		}
		game.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.send(204);
		});
	});
};

function getLetter(bag) {
	if (bag.length > 0) {
		var index = [Math.floor(Math.random() * bag.length)];
		return bag.splice(index, 1)[0];
	} else {
		return null;
	}

}

function handleError(res, err) {
	return res.send(500, err);
}