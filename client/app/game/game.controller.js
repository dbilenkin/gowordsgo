'use strict';

angular.module('livewordsApp').controller('GameCtrl', function($rootScope, $scope, $routeParams, $http, $timeout, $modal, socket, Auth) {

	$scope.game = {};
	$scope.gameid = $routeParams.id;

	$scope.currentTiles = [];
	$scope.placedTiles = [];
	$scope.legalSquares = {
		'77' : true
	};
	$scope.error = {};
	$scope.attemptedWords = [];
	$scope.utilities = Livewords.utilities;

	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.getCurrentUser = Auth.getCurrentUser;

	$scope.gameTime = "0";

	$timeout(function() {

		// $('#board-container')[0].addEventListener('touchmove', function(event){
		// event.stopPropagation();
		// });

		$('#board').hammer({
			prevent_default : true
		}).bind("doubletap", function(ev) {
			var event = ev.gesture;
			var top = $('#board-container').position().top;
			var left = $('#board-container').position().left;
			$('#board').toggleClass('smallboard');
			moveBoardToPosition(event.center.x - left, event.center.y - top);
		});

		$('#board').hammer({
			prevent_default : true
		}).bind("pinchin", function(ev) {
			var event = ev.gesture;
			var top = $('#board-container').position().top;
			$('#board').addClass('smallboard');
		});

		$('#board').hammer({
			prevent_default : true
		}).bind("pinchout", function(ev) {
			var event = ev.gesture;
			var top = $('#board-container').position().top;
			$('#board').removeClass('smallboard');
			moveBoardToPosition(event.center.x, event.center.y - top);
		});

		$('#board-container').dragscrollable({
			dragSelector : '.dragger',
			acceptPropagatedEvent : false,
			preventDefault : false
		});

	}, 100);

	function syncUpdates(event, updatedGame) {
		//ignore sync if updated by me
		if ($rootScope.currentPlayer.number == updatedGame.updatedBy) {
			return;
		}
		var now = new Date().getTime();
		$scope.gameTime = now - $scope.game.startTime;
		$scope.game = updatedGame;
		var board = $scope.game.board;
		var conflictedTiles = false;
		//TODO this is darn ugly :(
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board.length; j++) {
				if (board[i][j][0]) {

					addNearLegalSquares(i, j);

					for (var k = 0; k < $scope.placedTiles.length; k++) {
						if ($scope.placedTiles[k].row == i && $scope.placedTiles[k].col == j) {
							conflictedTiles = true;
						}
					}

				}
			}

		}

		$timeout(function() {
			for (var i = 0; i < board.length; i++) {
				for (var j = 0; j < board.length; j++) {
					if (board[i][j][0]) {

						var tileEl = $('#board').find('tr').eq(i).find('td').eq(j).find('div.tile');
						tileEl.addClass('nodrag dragger');
						tileEl.draggable("disable");

						var square = $('#board').find('tr').eq(i).find('td').eq(j);
						square.droppable("disable");
					}
				}
			}
			if (conflictedTiles && $scope.placedTiles.length > 0) {

				for (var i = 0; i < $scope.placedTiles.length; i++) {
					$scope.currentTiles.push($scope.placedTiles[i]);

					var row = $scope.placedTiles[i].row;
					var col = $scope.placedTiles[i].col;
					if (!$scope.game.board[row][col][0]) {
						var square = $('#board').find('tr').eq(row).find('td').eq(col);
						square.droppable("enable");
					}
				}

				$scope.placedTiles = [];

				$scope.error.label = "Too Slow";
				$scope.error.body = "This spot was already taken by another player.";
				$scope.openErrorModal();

			} else {
				for (var i = 0; i < $scope.placedTiles.length; i++) {
					var tile = $scope.placedTiles[i];
					if ($scope.game.board[tile.row][tile.col].length == 0) {
						$scope.game.board[tile.row][tile.col].push(tile);

					}

				}
			}
		}, 100);

	};

	$http.get('/api/games/' + $scope.gameid).success(function(game) {
		$scope.game = game;
		var board = $scope.game.board;
		$timeout(function() {
			for (var i = 0; i < board.length; i++) {
				for (var j = 0; j < board.length; j++) {
					if (board[i][j][0]) {

						addNearLegalSquares(i, j);

						var tileEl = $('#board').find('tr').eq(i).find('td').eq(j).find('div.tile');
						tileEl.addClass('nodrag');
						tileEl.draggable("disable");

						var square = $('#board').find('tr').eq(i).find('td').eq(j);
						square.droppable("disable");
					}
				}
			}

		}, 1000);

		if ($scope.game.status == 'started') {
			$scope.getNewTiles();
		}

		socket.syncUpdatesObject('game' + game._id, $scope.game, function(event, updatedGame) {
			syncUpdates(event, updatedGame);
		});

	});

	$.ui.intersect = (function(original) {
		return function(draggable, droppable, toleranceMode) {
			if (toleranceMode !== "closest") {
				return original.apply(this, arguments);
			}

			// custom logic here
		};
	})($.ui.intersect);

	$scope.boardTileDraggableOptions = {
		addClasses : false,
		revert : function(is_valid_drop) {
			//console.log("is_valid_drop = " + is_valid_drop);
			// when you're done, you need to remove the "dragging" class
			// and yes, I'm sure this can be refactored better, but I'm
			// out of time for today! :)
			if (!is_valid_drop) {
				//console.log("revert triggered");

				var square = this[0].parentElement;
				var row = square.parentElement.rowIndex;
				var col = square.cellIndex;

				if (row) {
					var tile = $scope.game.board[row][col][0];
					$scope.placedTiles.push(tile);
					$(square).droppable("disable");
				}

				var that = this;

				$timeout(function() {
					$(that).removeClass("hide");
				}, 100);

				console.log("revert true");
				return true;
			} else {
				console.log("revert false");
				return false;
			}
		},
		//revert : 'invalid',
		helper : 'clone',
		appendTo : 'body',
		containment : '#board-rack',
		revertDuration : 100,
		cursorAt : {
			left : 35,
			top : 35
		}
	}

	function addNearLegalSquares(row, col) {
		$scope.legalSquares['' + row + col] = true;
		$scope.legalSquares['' + (row + 1) + col] = true;
		$scope.legalSquares['' + (row - 1) + col] = true;
		$scope.legalSquares['' + row + (col + 1)] = true;
		$scope.legalSquares['' + row + (col - 1)] = true;

	}


	$scope.startGame = function() {
		$scope.game.status = 'started';
		$scope.game.startTime = new Date();
		$scope.getNewTiles();
	};

	$scope.getNewTiles = function() {

		$http.get('/api/games/' + $scope.game._id + "/getNewTiles").success(function(resp) {
			$scope.game.bag = resp.bag;
			$scope.addTilesToRack(resp.letters);

		});

	}

	$scope.swapTiles = function() {

		if ($scope.placedTiles.length > 0) {
			$scope.error.label = "Can't Swap Now";
			$scope.error.body = "You can't have any tiles down when you swap.";
			return false;
		}

		$http.put('/api/games/' + $scope.game._id + "/swapTiles", $scope.currentTiles).success(function(resp) {
			$scope.game = resp.game;
			$scope.currentTiles = [];
			$scope.addTilesToRack(resp.letters);

		});

	};

	$scope.shuffleTiles = function() {

		var tempTiles = [];
		while ($scope.currentTiles.length > 0) {
			var index = Math.floor(Math.random() * $scope.currentTiles.length);
			tempTiles.push($scope.currentTiles.splice(index, 1)[0]);
		}
		$scope.currentTiles = tempTiles.slice(0);

	};

	$scope.addTilesToRack = function(newLetters) {

		console.log("addTilesToRack");

		for (var i = 0; i < newLetters.length; i++) {
			$scope.currentTiles.push({
				'letter' : newLetters[i],
				'points' : $scope.utilities.letterDist[newLetters[i]][1],
				'col' : -1,
				'row' : -1
			});

		}

		// $timeout(function() {
		// $('.rack .tile').addClass('player' + $rootScope.currentPlayer.number)
		// }, 100);

	};

	$scope.stopDragging = function() {
		//$(".tile").removeClass('hide');
		console.log("stopDragging");
	}

	$scope.isCurrentPlayer = function(player) {
		if ($rootScope.currentPlayer) {
			return player.number === $rootScope.currentPlayer.number;
		} else {
			return false;
		}

	};

	$scope.moveFromRack = function(event, tile, index) {

		$scope.droppedInRack = false;

		$(tile.helper[0]).addClass("dragbig");
		$("#rack div:nth-child(" + (index + 1) + ")").addClass('hide')

	};

	$scope.droppedInRack = false;

	$scope.updateRack = function(event, tile, index) {

		$(tile.helper[0]).removeClass("dragbig");

		var something = event;
		$scope.droppedInRack = true;

	};

	$scope.moveTile = function(event, tile, row, col) {

		$scope.droppedInRack = false;

		$(tile.helper[0]).addClass("dragbig");

		for (var i = 0; i < $scope.placedTiles.length; i++) {
			if ($scope.placedTiles[i].row === row && $scope.placedTiles[i].col === col) {
				$scope.placedTiles.splice(i, 1);
			}
		}

		var tile = $('#board').find('tr').eq(row).find('td').eq(col).find('div.tile');
		tile.addClass('hide');

		var square = $('#board').find('tr').eq(row).find('td').eq(col);
		square.droppable("enable");

	};

	$scope.updateTile = function(event, tile, row, col) {

		console.log("updateTile: " + tile.draggable[0].textContent.trim().substring(0, 1) + ", row: " + row + ", col: " + col);

		$(".tile").removeClass('hide');
		$(tile.helper[0]).removeClass("dragbig");

		if ($scope.droppedInRack) {
			console.log("droppedInRack");
			$scope.game.board[row][col] = [];
			$scope.droppedInRack = false;
			return;
		}

		$scope.game.board[row][col][0].row = row;
		$scope.game.board[row][col][0].col = col;
		var tile = $scope.game.board[row][col][0];

		var square = $('#board').find('tr').eq(row).find('td').eq(col);
		square.droppable("disable");

		$scope.placedTiles.push(tile);

		if ($('#board').hasClass('smallboard')) {
			var top = $('#board-container').position().top;
			var left = $('#board-container').position().left;
			$('#board').removeClass('smallboard');

			moveBoardToPosition(event.clientX - left, event.clientY - top);
		}

		// $timeout(function() {
		// $('#board .tile').addClass('player' + $rootScope.currentPlayer.number)
		// }, 100);

	};

	$scope.openErrorModal = function() {

		if ($scope.modalOpened) {
			return;
		}

		var modalInstance = $modal.open({
			templateUrl : 'errorModalContent.html',
			controller : 'ErrorModalInstanceCtrl',
			resolve : {
				error : function() {
					return $scope.error;
				}
			}
		});

		$scope.modalOpened = true;

		modalInstance.result.then(function() {
			$scope.modalOpened = false;
		}, function() {
			$scope.modalOpened = false;
		});
	};

	function legalPlacement(vertical) {

		if ($scope.placedTiles.length === 0) {
			$scope.error.label = "No Tiles Placed";
			$scope.error.body = "Umm, you didn't put any tiles down.";
			return false;

		}

		var legalSquare = false;
		for (var i = 0; i < $scope.placedTiles.length; i++) {
			//check all in a row or column
			if (vertical) {
				if ($scope.placedTiles[0].col != $scope.placedTiles[i].col) {
					$scope.error.label = "Illegal Tile Placement";
					$scope.error.body = "Tiles must be placed in a line.";
					return false;
				}
			} else {
				if ($scope.placedTiles[0].row != $scope.placedTiles[i].row) {
					$scope.error.label = "Illegal Tile Placement";
					$scope.error.body = "Tiles must be placed in a line.";
					return false;
				}
			}

			if ($scope.legalSquares["" + $scope.placedTiles[i].row + $scope.placedTiles[i].col]) {
				legalSquare = true;
			}

		}

		if (!legalSquare) {
			$scope.error.label = "Illegal Tile Placement";
			$scope.error.body = "Tiles must be placed next to an existing tile.";
		}
		return legalSquare;

	}


	$scope.checkWord = function() {

		var possibleWords = [];
		var vertical = true;
		if ($scope.placedTiles.length > 1) {
			if ($scope.placedTiles[0].row === $scope.placedTiles[1].row) {
				vertical = false;
			}
		}

		if (!legalPlacement(vertical)) {
			$scope.openErrorModal();
			//removePlacedTiles();
			return;
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

		if (possibleWords.length === 0) {
			$scope.error.label = "One Letter Word?";
			$scope.error.body = "Words have to be at least 2 letters long.";
			$scope.openErrorModal();
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
				$scope.error.badWord = possibleWords[i];
				badWord = true;
			}
		}

		if (oneGoodWord && !badWord) {

			var gameVersionPreUpdate = $scope.game.version;

			var updatedBoard = {
				gameVersion : $scope.game.version,
				placedTiles : $scope.placedTiles,
				updatedBy : $rootScope.currentPlayer.number,
				score : wordsScore
			};

			$http.put('/api/games/' + $scope.game._id + "/board", updatedBoard).success(function(resp) {

				if (resp === "conflict") {
					$scope.error.label = "Too Slow";
					$scope.error.body = "This spot was already taken by another player.";
					$scope.openErrorModal();
					//only remove tiles if there wasn't a sync already
					if ($scope.game.version === gameVersionPreUpdate) {
						removePlacedTiles();
					}

				} else if (resp === "outdated") {
					$scope.error.label = "Outdated Board";
					$scope.error.body = "The board was updated. Is your play still legal?";
					$scope.openErrorModal();

				} else {
					var game = resp.game;
					$scope.game = game;
					$rootScope.currentPlayer.score += wordsScore;
					$scope.game.players[$rootScope.currentPlayer.number].score += wordsScore;

					for (var i = 0; i < $scope.placedTiles.length; i++) {
						var row = $scope.placedTiles[i].row;
						var col = $scope.placedTiles[i].col;

						addNearLegalSquares(row, col);
						var tile = $('#board').find('tr').eq(row).find('td').eq(col).find('div.tile');

						tile.addClass('nodrag dragger');
						tile.draggable("disable");

						//this is to set the new disabled tiles to drag the board
						$('#board-container').removedragscrollable();
						$('#board-container').dragscrollable({
							dragSelector : '.dragger',
							acceptPropagatedEvent : false,
							preventDefault : false
						});

					}

					$scope.placedTiles = [];
					$scope.addTilesToRack(resp.letters);

				}
			});

		} else {
			$scope.error.label = "Not A Word";
			$scope.error.body = $scope.error.badWord.toUpperCase() + " is not a word.";
			$scope.openErrorModal();
			//removePlacedTiles();
		}

	};

	function removePlacedTiles() {
		for (var i = 0; i < $scope.placedTiles.length; i++) {
			var row = $scope.placedTiles[i].row;
			var col = $scope.placedTiles[i].col;
			$scope.game.board[row][col] = [];
			var square = $('#board').find('tr').eq(row).find('td').eq(col);
			square.droppable("enable");
			$scope.currentTiles.push($scope.placedTiles[i]);
		}
		$scope.placedTiles = [];
	}

	function moveBoardToPosition(x, y) {

		$('#board-container').scrollTop(y);
		$('#board-container').scrollLeft(x);
	}

});
