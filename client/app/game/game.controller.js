'use strict';

angular.module('livewordsApp').controller('GameCtrl', function($rootScope, $scope, $routeParams, $http, $timeout, socket, Auth) {

	$scope.game = {};
	$scope.gameid = $routeParams.id;

	$scope.currentTiles = [];
	$scope.placedTiles = [];
	$scope.attemptedWords = [];
	$scope.utilities = Livewords.utilities;

	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.getCurrentUser = Auth.getCurrentUser;

	$http.get('/api/games/' + $scope.gameid).success(function(game) {
		$scope.game = game;
		socket.syncUpdatesObject('game', $scope.game, function(event, updatedGame) {
			$scope.game = updatedGame;
			var board = $scope.game.board;
			
			var conflictedTiles =  [];
			//TODO this is darn ugly :(
			for (var i = 0; i < board.length; i++) {
				for (var j = 0; j < board.length; j++) {
					if (board[i][j][0]) {
						
						for (var k = 0; k < $scope.placedTiles.length; k++) {
							if ($scope.placedTiles[k].row == i && $scope.placedTiles[k].col == j) {
								conflictedTiles.push($scope.placedTiles[k]);
							} 
						}
						
							
						(function(i, j){

					       $timeout(function() {
								var row = i;
								var col = j;
						        var tileEl = $('#board').find('tr').eq(row).find('td').eq(col).find('div.tile');
								tileEl.addClass('nodrag');
								tileEl.draggable("disable");
						    }, 100);
					   })(i, j);
							
							
					}
				}
				
			}
			
			if (conflictedTiles.length > 0) {
				
				for (var i = 0; i < $scope.placedTiles.length; i++) {
					for (var j = 0; j < conflictedTiles.length; j++) {
						if ($scope.placedTiles[i].row != conflictedTiles[j].row || $scope.placedTiles[i].col != conflictedTiles[j].col) {
							$scope.game.board[$scope.placedTiles[i].row][$scope.placedTiles[i].col] = [];
						}
					}
					$scope.currentTiles.push($scope.placedTiles[i]);
				}
				
			}
			
		});

	});
	
	$scope.startGame = function() {
	
		
		$scope.game.active = true;
		$scope.getTiles();
	};

	$scope.swapTiles = function() {
		for (var i = 0; i < $scope.currentTiles.length; i++) {
			$scope.game.bag.push($scope.currentTiles[i].letter);
		}
		$scope.currentTiles = [];
		$scope.getTiles();
	};

	$scope.getTiles = function() {
		
		var tilesToGet = 7 - $scope.currentTiles.length;

		for (var j = 0; j < tilesToGet; j++) {
			var letter = $scope.utilities.getLetter($scope.game.bag);
			$scope.currentTiles.push({
				'letter' : letter,
				'points' : $scope.utilities.letterDist[letter][1],
				'col' : -1,
				'row' : -1
			});

		}
		
		if (tilesToGet > 0) {
			$http.put('/api/games/' + $scope.game._id, $scope.game);
		}
		
	};

	$scope.isCurrentPlayer = function(player) {
		if ($scope.currentPlayer) {
			return player.name === $scope.currentPlayer.name;
		} else {
			return false;
		}

	};

	$scope.moveFromRack = function(event, tile, index) {

		//$(tile.helper[0]).addClass("dragbig");

	};

	$scope.updateRack = function(event, tile, index) {

	};

	$scope.moveTile = function(event, tile, row, col) {
		
		for (var i = 0; i < $scope.placedTiles.length; i++) {
			if ($scope.placedTiles[i].row === row && $scope.placedTiles[i].col === col) {
				$scope.placedTiles.splice(i, 1);
			}
		}
		
		var square = $('#board').find('tr').eq(row).find('td').eq(col);
		square.droppable( "enable" );
		
		
	};

	$scope.updateTile = function(event, tile, row, col) {

		$scope.game.board[row][col][0].row = row;
		$scope.game.board[row][col][0].col = col;
		var tile = $scope.game.board[row][col][0];
		
		
		var square = $('#board').find('tr').eq(row).find('td').eq(col);
		square.droppable( "disable" );

		$scope.placedTiles.push(tile);
		
		

	};

	$scope.checkWord = function() {

		var possibleWords = [];
		var vertical = true;
		if ($scope.placedTiles.length > 1) {
			if ($scope.placedTiles[0].row === $scope.placedTiles[1].row) {
				vertical = false;
			}
		}

		var tile = $scope.placedTiles[0];
		var firstTile = tile;
		var possibleWord = '';

		if (!vertical) {
			for (var h = tile.col - 1; h >= 0; h--) {
				if ($scope.game.board[tile.row][h][0]) {
					firstTile = $scope.game.board[tile.row][h][0];
				} else {
					break;
				}
			}

			possibleWord = firstTile.letter;

			for ( h = firstTile.col + 1; h <= 14; h++) {
				if ($scope.game.board[tile.row][h][0]) {
					possibleWord += $scope.game.board[tile.row][h][0].letter;
				} else {
					break;
				}
			}
		} else {
			for (var v = tile.row - 1; v >= 0; v--) {
				if ($scope.game.board[v][tile.col][0]) {
					firstTile = $scope.game.board[v][tile.col][0];
				} else {
					break;
				}
			}

			possibleWord = firstTile.letter;

			for ( v = firstTile.row + 1; v <= 14; v++) {
				if ($scope.game.board[v][tile.col][0]) {
					possibleWord += $scope.game.board[v][tile.col][0].letter;
				} else {
					break;
				}
			}
		}
		if (possibleWord.length > 1) {
			possibleWords.push(possibleWord.toLowerCase());
		}

		for (var i = 0; i < $scope.placedTiles.length; i++) {
			tile = $scope.placedTiles[i];
			firstTile = tile;

			if (vertical) {
				for ( h = tile.col - 1; h >= 0; h--) {
					if ($scope.game.board[tile.row][h][0]) {
						firstTile = $scope.game.board[tile.row][h][0];
					} else {
						break;
					}
				}

				possibleWord = firstTile.letter;

				for ( h = firstTile.col + 1; h <= 14; h++) {
					if ($scope.game.board[tile.row][h][0]) {
						possibleWord += $scope.game.board[tile.row][h][0].letter;
					} else {
						break;
					}
				}
			} else {
				for ( v = tile.row - 1; v >= 0; v--) {
					if ($scope.game.board[v][tile.col][0]) {
						firstTile = $scope.game.board[v][tile.col][0];
					} else {
						break;
					}
				}

				possibleWord = firstTile.letter;

				for ( v = firstTile.row + 1; v <= 14; v++) {
					if ($scope.game.board[v][tile.col][0]) {
						possibleWord += $scope.game.board[v][tile.col][0].letter;
					} else {
						break;
					}
				}
			}

			if (possibleWord.length > 1) {
				possibleWords.push(possibleWord.toLowerCase());
			}

		}

		var oneGoodWord = false;
		var badWord = false;
		var goodWords = [];
		var wordsScore = 0;

		for ( i = 0; i < possibleWords.length; i++) {
			if ($.inArray(possibleWords[i], $rootScope.words) !== -1) {
				oneGoodWord = true;
				wordsScore += $scope.utilities.getScore(possibleWords[i].toUpperCase(), $scope.placedTiles);
			} else {
				badWord = true;
			}
		}

		if (oneGoodWord && !badWord) {
			$scope.currentPlayer.score += wordsScore;
			$scope.game.players[$scope.currentPlayer.playerNumber].score += wordsScore;
			//$http.put('/api/games/' + $scope.game._id, $scope.game);
			
			
			for (var i = 0; i < $scope.placedTiles.length; i++) {
				var row = $scope.placedTiles[i].row;
				var col = $scope.placedTiles[i].col;
				var tile = $('#board').find('tr').eq(row).find('td').eq(col).find('div.tile');
				tile.addClass('nodrag');
				tile.draggable("disable");
			}
			
			
		} else {
			for (var i = 0; i < $scope.placedTiles.length; i++) {
				$scope.game.board[$scope.placedTiles[i].row][$scope.placedTiles[i].col] = [];
				$scope.currentTiles.push($scope.placedTiles[i]);
			}
		}

		$scope.placedTiles = [];
		$scope.getTiles();

	}
});
