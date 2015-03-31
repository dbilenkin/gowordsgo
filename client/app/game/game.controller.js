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
	$scope.u = Livewords.utilities;

	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.getCurrentUser = Auth.getCurrentUser;

	$scope.gameTime = "0";

	$timeout(function() {

		// $('#board-container')[0].addEventListener('touchmove', function(event){
		// event.stopPropagation();
		// });
		var panx = 0;
		var pany = 0;
		
		var el = document.querySelector("#board");
		
		var mc = new Hammer.Manager(el);

		mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
		mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(mc.get('pan'));
	
		mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
	
		mc.on("panstart", function(event) {
			panx = event.center.x;
			pany = event.center.y;
		});
		
		mc.on("panmove", function(event) {
			
			var target = event.target;
			
			if (!$(target).hasClass('dragger')) {
				return;
			}
			var scrollable = $('#board-container');
			var deltax = panx - event.center.x;
			var deltay = pany - event.center.y;

			scrollable.scrollTop(scrollable.scrollTop() + deltay);
			scrollable.scrollLeft(scrollable.scrollLeft() + deltax);
			
			panx = event.center.x;
			pany = event.center.y;
			
		});
		
		
		
		mc.on("pinchin", function(event) {
			var top = $('#board-container').position().top;	
			$('#board').addClass('smallboard');
		});
		
		mc.on("pinchout", function(event) {
			var top = $('#board-container').position().top;
			$('#board').removeClass('smallboard');
			moveBoardToPosition(event.center.x, event.center.y - top);
		});
		
		mc.on("doubletap", function(event) {
			if ($('#board').hasClass('smallboard')) {
				var top = $('#board-container').position().top;
				var left = $('#board-container').position().left;
				$('#board').removeClass('smallboard');
				moveBoardToPosition(event.center.x, event.center.y - top);
				// $('#board').removeClass('smallboard', {
					// duration: 500,
					// queue: true,
					// children: true
				// });
// 				
				// $('#board-container').animate({ 
					// scrollTop: event.center.y - top,
					// scrollLeft: event.center.x - left
				// }, {
					// duration: 500,
					// queue: true
				// });
			} else {
				$('#board').addClass('smallboard');
				// $('#board').addClass('smallboard', {
					// duration: 500,
					// queue: true,
					// children: true
				// });
			}
			
			
		});

		// $('#board-container').dragscrollable({
			// dragSelector : '.dragger',
			// acceptPropagatedEvent : false,
			// preventDefault : false
		// });

	}, 100);

	function syncUpdates(event, updatedGame) {
		//ignore sync if updated by me
		if ($rootScope.currentPlayer.number == updatedGame.updatedBy) {
			return;
		}
		
		if (updatedGame.status == 'over') {
			var winner = $scope.game.players[updatedGame.winner];
			$scope.error.label = "You Lost!";
			$scope.error.body = winner.name + " won the game, with a score of " + winner.score;
			$scope.openErrorModal();
		}
		var now = new Date().getTime();
		$scope.gameTime = now - $scope.game.startTime;
		$scope.game = updatedGame;
		var board = $scope.game.board;
		$scope.playerColumnWidth = 'col-xs-'+(12/$scope.game.players.length);
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

						var tileEl = $('#board div.board-row:nth-child('+(i+1)+') div.cell:nth-child('+(j+1)+')').find('div.tile');
						tileEl.addClass('nodrag dragger');
						tileEl.draggable("disable");

						var square = $('#board div.board-row:nth-child('+(i+1)+') div.cell:nth-child('+(j+1)+')');
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
						var square = $('#board div.board-row:nth-child('+(row+1)+') div.cell:nth-child('+(col+1)+')');
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

						var tileEl = $('#board div.board-row:nth-child('+(i+1)+') div.cell:nth-child('+(j+1)+')').find('div.tile');
						tileEl.addClass('nodrag');
						tileEl.draggable("disable");

						var square = $('#board div.board-row:nth-child('+(i+1)+') div.cell:nth-child('+(j+1)+')');
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
		
		$scope.playerColumnWidth = 'col-xs-'+(12/game.players.length);

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
				var row = $(square.parentElement).index();
				var col = $(square).index();
				
				console.log("row: " + row);

				if ($(square).attr('id') != 'rack') {
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
		//containment : '#board-rack',
		revertDuration : 100,
		cursorAt : {
			left : 35,
			top : 35
		}
	};

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
		
		var putBody = {
			updatedBy: $rootScope.currentPlayer.number
		};

		$http.put('/api/games/' + $scope.game._id + "/getNewTiles", putBody).success(function(resp) {
			$scope.game = resp.game;
			$scope.addTilesToRack(resp.letters);

		});

	};

	$scope.swapTiles = function() {
		
		var putBody = {
			updatedBy: $rootScope.currentPlayer.number,
			currentTiles: $scope.currentTiles
		};

		if ($scope.placedTiles.length > 0) {
			$scope.error.label = "Can't Swap Now";
			$scope.error.body = "You can't have any tiles down when you swap.";
			return false;
		}

		$http.put('/api/games/' + $scope.game._id + "/swapTiles", putBody).success(function(resp) {
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
				'points' : $scope.u.letterDist[newLetters[i]][1],
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
	};

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
		$("#rack div.tile:nth-child(" + (index + 1) + ")").addClass('hide');

	};

	$scope.droppedInRack = false;

	$scope.updateRack = function(event, tile, index) {

		$(tile.helper[0]).removeClass("dragbig");

		var something = event;
		$scope.droppedInRack = true;
		
		$scope.checkWord();

	};

	$scope.moveTile = function(event, tile, row, col) {

		$scope.droppedInRack = false;

		$(tile.helper[0]).addClass("dragbig");

		for (var i = 0; i < $scope.placedTiles.length; i++) {
			if ($scope.placedTiles[i].row === row && $scope.placedTiles[i].col === col) {
				$scope.placedTiles.splice(i, 1);
			}
		}

		var tile = $('#board div.board-row:nth-child('+(row+1)+') div.cell:nth-child('+(col+1)+')').find('div.tile');
		tile.addClass('hide');

		var square = $('#board div.board-row:nth-child('+(row+1)+') div.cell:nth-child('+(col+1)+')');
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

		var square = $('#board div.board-row:nth-child('+(row+1)+') div.cell:nth-child('+(col+1)+')');
		square.droppable("disable");

		$scope.placedTiles.push(tile);

		if ($('#board').hasClass('smallboard')) {
			var top = $('#board-container').position().top;
			var left = $('#board-container').position().left;
			$('#board').removeClass('smallboard');

			moveBoardToPosition(event.clientX - left, event.clientY - top);
		}
		
		$scope.checkWord();

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
		$scope.legalPlacement = legalSquare;
		return legalSquare;

	}
	
	$scope.go = function() {
		
		if ($scope.placedTiles.length === 0) {
			$scope.error.label = "No Tiles Placed";
			$scope.error.body = "Umm, you didn't put any tiles down.";
			$scope.openErrorModal();
			return;

		}
		
		if (!$scope.legalPlacement) {
			$scope.openErrorModal();
			//removePlacedTiles();
			return;
		}
		
		if ($scope.oneGoodWord && !$scope.badWord) {

			var gameVersionPreUpdate = $scope.game.version;
			var rackEmpty = $scope.currentTiles == 0;

			var updatedBoard = {
				gameVersion : $scope.game.version,
				placedTiles : $scope.placedTiles,
				updatedBy : $rootScope.currentPlayer.number,
				score : $scope.wordsScore,
				rackEmpty : rackEmpty
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
					$rootScope.currentPlayer.score += $scope.wordsScore;
					$scope.game.players[$rootScope.currentPlayer.number].score += $scope.wordsScore;

					for (var i = 0; i < $scope.placedTiles.length; i++) {
						var row = $scope.placedTiles[i].row;
						var col = $scope.placedTiles[i].col;

						addNearLegalSquares(row, col);
						var tile = $('#board div.board-row:nth-child('+(row+1)+') div.cell:nth-child('+(col+1)+')').find('div.tile');

						tile.addClass('nodrag dragger');
						tile.draggable("disable");

						//this is to set the new disabled tiles to drag the board
						// $('#board-container').removedragscrollable();
						// $('#board-container').dragscrollable({
							// dragSelector : '.dragger',
							// acceptPropagatedEvent : false,
							// preventDefault : false
						// });

					}

					$scope.placedTiles = [];
					
					
					if (resp.letters.length == 0 && $scope.currentTiles.length == 0) {
						$scope.error.label = "You Won!";
						$scope.error.body = "You really did it!";
						$scope.openErrorModal();
					} else {
						$scope.addTilesToRack(resp.letters);
					}

				}
			});

		} else if ($scope.badWord) {
			$scope.error.label = "Not A Word";
			$scope.error.body = $scope.error.badWord.toUpperCase() + " is not a word.";
			$scope.openErrorModal();
			//removePlacedTiles();
		} else {
			$scope.error.label = "One Letter Word?";
			$scope.error.body = "Words must be at least 2 letters long.";
			$scope.openErrorModal();
		}

		
	};


	$scope.checkWord = function() {
		
		for (var i = 0; i < $scope.placedTiles.length; i++) {
			$scope.placedTiles[i].wordsScore = 0;
		}
		

		var possibleWords = [];
		var vertical = true;
		if ($scope.placedTiles.length > 1) {
			if ($scope.placedTiles[0].row === $scope.placedTiles[1].row) {
				vertical = false;
			}
		}

		if (!legalPlacement(vertical)) {
			//$scope.openErrorModal();
			//removePlacedTiles();
			return;
		}

		var tile = $scope.placedTiles[0];
		var firstTile = tile;
		var possibleWord = [];

		if (!vertical) {
			for (var h = tile.col - 1; h >= 0; h--) {
				if ($scope.game.board[tile.row][h][0]) {
					firstTile = $scope.game.board[tile.row][h][0];
				} else {
					break;
				}
			}

			possibleWord.push(firstTile);

			for ( h = firstTile.col + 1; h <= 14; h++) {
				if ($scope.game.board[tile.row][h][0]) {
					possibleWord.push($scope.game.board[tile.row][h][0]);
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

			possibleWord.push(firstTile);

			for ( v = firstTile.row + 1; v <= 14; v++) {
				if ($scope.game.board[v][tile.col][0]) {
					possibleWord.push($scope.game.board[v][tile.col][0]);
				} else {
					break;
				}
			}
		}
		if (possibleWord.length > 1) {
			possibleWords.push(possibleWord);
		}

		for (var i = 0; i < $scope.placedTiles.length; i++) {
			tile = $scope.placedTiles[i];
			firstTile = tile;
			possibleWord = [];

			if (vertical) {
				for ( h = tile.col - 1; h >= 0; h--) {
					if ($scope.game.board[tile.row][h][0]) {
						firstTile = $scope.game.board[tile.row][h][0];
					} else {
						break;
					}
				}

				possibleWord.push(firstTile);
				

				for ( h = firstTile.col + 1; h <= 14; h++) {
					if ($scope.game.board[tile.row][h][0]) {
						possibleWord.push($scope.game.board[tile.row][h][0]);
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

				possibleWord.push(firstTile);

				for ( v = firstTile.row + 1; v <= 14; v++) {
					if ($scope.game.board[v][tile.col][0]) {
						possibleWord.push($scope.game.board[v][tile.col][0]);
					} else {
						break;
					}
				}
			}

			if (possibleWord.length > 1) {
				possibleWords.push(possibleWord);
			}

		}

		

		$scope.oneGoodWord = false;
		$scope.badWord = false;
		$scope.goodWords = [];
		$scope.wordsScore = 0;

		for ( i = 0; i < possibleWords.length; i++) {
			if ($.inArray($scope.u.getWordFromTiles(possibleWords[i]), $rootScope.words) !== -1) {
				$scope.oneGoodWord = true;
				$scope.goodWords.push(possibleWords[i]);
			} else {
				$scope.error.badWord = $scope.u.getWordFromTiles(possibleWords[i]).toUpperCase();
				$scope.badWord = true;
			}
			
			$scope.wordsScore += $scope.u.getScore(possibleWords[i], $scope.placedTiles);
		}
		
		$scope.placedTiles[$scope.placedTiles.length - 1].wordsScore = $scope.wordsScore;

		
	};

	function removePlacedTiles() {
		for (var i = 0; i < $scope.placedTiles.length; i++) {
			var row = $scope.placedTiles[i].row;
			var col = $scope.placedTiles[i].col;
			$scope.game.board[row][col] = [];
			var square = $('#board div.board-row:nth-child('+(row+1)+') div.cell:nth-child('+(col+1)+')');
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
