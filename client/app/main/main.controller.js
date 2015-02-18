'use strict';

angular.module('livewordsApp').controller('MainCtrl', function($scope, $http, socket) {

	$scope.tiles = [];
	$scope.words = [];
	$scope.board = [];
	$scope.placedTiles = [];
	$scope.attemptedWords = [];
	
	for (var i = 0; i < 15; i++) {
		$scope.board[i] = [];
		for (var j = 0; j < 15; j++) {
			$scope.board[i][j] = null;
		}
	}

	function getLetters() {
		

		function getRandomLetter() {
			return String.fromCharCode(65 + Math.floor(Math.random() * 26));
		}

		for (var i = 0; i < 1; i++) {
			for (var j = 0; j < 7; j++) {
				var letter = getRandomLetter();
				var tile = {
					sizeX : 1,
					sizeY : 1,
					row : i,
					col : j,
					content : letter
				};
				$scope.board[i][j] = tile;
				$http.post('/api/tiles', tile);
			}
		}
		socket.syncUpdates('tile', $scope.tiles);
	}

	

	$scope.newGame = function() {
		$scope.tiles = [];
		$http.delete('/api/tiles').success(function(data) {
			//socket.syncUpdates('tile', $scope.tiles);
		});
		
		getLetters();

	};

	$http.get('/api/tiles').success(function(tiles) {
		$scope.tiles = tiles;
		socket.syncUpdates('tile', $scope.tiles);
	});

	$http.get('assets/twl06.txt').success(function(data) {
		processWords(data);
	});

	function processWords(data) {
		$scope.words = data.split('\n');
	}


	$scope.gridsterOpts = {
		columns : 15, // the width of the grid, in columns
		pushing : false, // whether to push other items out of the way on move or resize
		floating : false, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
		swapping : false, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
		width : 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
		colWidth : 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
		rowHeight : 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
		margins : [10, 10], // the pixel distance between each widget
		outerMargin : true, // whether margins apply to outer edges of the grid
		isMobile : false, // stacks the grid items if true
		mobileBreakPoint : 600, // if the screen is not wider that this, remove the grid layout and stack the items
		mobileModeEnabled : true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
		minColumns : 15, // the minimum columns the grid must have
		minRows : 15, // the minimum height of the grid, in rows
		maxRows : 15,
		defaultSizeX : 2, // the default width of a gridster item, if not specifed
		defaultSizeY : 1, // the default height of a gridster item, if not specified
		minSizeX : 1, // minimum column width of an item
		maxSizeX : null, // maximum column width of an item
		minSizeY : 1, // minumum row height of an item
		maxSizeY : null, // maximum row height of an item
		resizable : {
			enabled : false,
			handles : ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
			//start: function(event, $element, widget) {}, // optional callback fired when resize is started,
			//resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
			//stop: function(event, $element, widget) {} // optional callback fired when item is finished resizing
		},
		draggable : {
			enabled : true, // whether dragging items is supported
			handle : '.my-class', // optional selector for resize handle
			start : function(event, $element, tile) {
				removeTileFromBoard(tile);
			}, // optional callback fired when drag is started,
			//drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
			stop : function(event, $element, tile) {
				updateTile(tile);
			} // optional callback fired when item is finished dragging
		}
	};

	var removeTileFromBoard = function(tile) {
		$scope.board[tile.row][tile.col] = null;
	};
	
	var updateTile = function(tile) {
		$http.put('/api/tiles/' + tile._id, tile);
		$scope.board[tile.row][tile.col] = tile;
		$scope.placedTiles.push(tile);
		socket.syncUpdates('tile', $scope.tiles);
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
		var firstLetter = tile;
		var possibleWord = '';

		if (!vertical) {
			for (var h = tile.col - 1; h >= 0; h--) {
				if ($scope.board[tile.row][h]) {
					firstLetter = $scope.board[tile.row][h];
				} else {
					break;
				}
			}

			possibleWord = firstLetter.content;

			for (h = firstLetter.col + 1; h <= 14; h++) {
				if ($scope.board[tile.row][h]) {
					possibleWord += $scope.board[tile.row][h].content;
				} else {
					break;
				}
			}
		} else {
			for (var v = tile.row - 1; v >= 0; v--) {
				if ($scope.board[v][tile.col]) {
					firstLetter = $scope.board[v][tile.col];
				} else {
					break;
				}
			}

			possibleWord = firstLetter.content;

			for (v = firstLetter.row + 1; v <= 14; v++) {
				if ($scope.board[v][tile.col]) {
					possibleWord += $scope.board[v][tile.col].content;
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
			firstLetter = tile;

			if (vertical) {
				for (h = tile.col - 1; h >= 0; h--) {
					if ($scope.board[tile.row][h]) {
						firstLetter = $scope.board[tile.row][h];
					} else {
						break;
					}
				}

				possibleWord = firstLetter.content;

				for (h = firstLetter.col + 1; h <= 14; h++) {
					if ($scope.board[tile.row][h]) {
						possibleWord += $scope.board[tile.row][h].content;
					} else {
						break;
					}
				}
			} else {
				for (v = tile.row - 1; v >= 0; v--) {
					if ($scope.board[v][tile.col]) {
						firstLetter = $scope.board[v][tile.col];
					} else {
						break;
					}
				}

				possibleWord = firstLetter.content;

				for (v = firstLetter.row + 1; v <= 14; v++) {
					if ($scope.board[v][tile.col]) {
						possibleWord += $scope.board[v][tile.col].content;
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

		for (i = 0; i < possibleWords.length; i++) {
			if ($.inArray(possibleWords[i], $scope.words) !== -1) {
				oneGoodWord = true;
				alert(possibleWords[i] + ' is a word!');
			} else {
				alert('Dude, ' + possibleWords[i] + ' is not a word!');
			}
		}

		$scope.placedTiles = [];

	}

	$scope.$on('$destroy', function() {
		socket.syncUpdates('tile', $scope.tiles);
	});

});
