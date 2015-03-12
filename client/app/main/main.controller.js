'use strict';

angular.module('livewordsApp').controller('MainCtrl', function($rootScope, $scope, $location, $http, $modal, socket, Auth) {
	
	// document.addEventListener("touchmove", function(event){
	    // event.preventDefault();
	// });

	$rootScope.words = [];
	$scope.utilities = Livewords.utilities;

	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.getCurrentUser = Auth.getCurrentUser;

	$scope.boardSizes = [7, 11, 15];
	$scope.options = {
		boardSizes : [7, 11, 15],
		bagSizes : [{
			id : 0,
			label : 'Classic'
		}, {
			id : 3,
			label : 'Full'
		}, {
			id : 4,
			label : 'Half'
		}, {
			id : 5,
			label : 'Third'
		}]
	};
	
	$scope.selectedOptions = {};
	
	

	$http.get('/api/games').success(function(games) {
		$scope.games = games;
		socket.syncUpdates('game', $scope.games, function(event, updatedGame, games) {
			$scope.games = games;
		});
	});

	$http.get('assets/twl06.txt').success(function(data) {
		processWords(data);
	});

	$scope.createGame = function() {

		var modalInstance = $modal.open({
			templateUrl : 'gameModalContent.html',
			controller : 'GameModalInstanceCtrl',
			resolve : {
				options : function() {
					return $scope.options;
				}
			}
		});

		modalInstance.result.then(function(selectedOptions) {
			$scope.selectedOptions = selectedOptions;
			$scope.newGame();
		}, function() {

		});
	};

	function initBag(game) {
		var sizeIndex = $scope.selectedOptions.bagSize.id;
		game.bag = [];
		$scope.utilities.initBag(game.bag, sizeIndex);

	}

	function initBoard(game) {

		var size = $scope.selectedOptions.boardSize;
		game.board = [];
		for (var i = 0; i < size; i++) {
			game.board[i] = [];
			for (var j = 0; j < size; j++) {
				game.board[i][j] = [];
			}
		}

	}
	
	
	function addPlayerCss(player) {
		var playerNumber = player.number;
		
		var r = Math.floor(Math.random() * 256);
		var g = Math.floor(Math.random() * 256);
		var b = Math.floor(Math.random() * 256);
		
		player.color = [r, g, b];
		var color = $scope.utilities.getForegroundColor(r, g, b);
		
		$('<style>.player' + playerNumber +
		'{ background-color: rgb('+ r + ',' + g + ',' + b + '); }' +
		'{ background-color: ' + color + '; }' +
		'</style>').appendTo('body');
	}

	function initPlayer(game) {

		var player = {};
		var playerNumber = game.players.length;
		if ($scope.isLoggedIn()) {
			player = $scope.getCurrentUser();
		} else {
			player = {
				'name' : 'Player ' + (playerNumber + 1)
			};
		}

		player.number = playerNumber;
		player.score = 0;
		player.ready = false;
		addPlayerCss(player);
		
		$rootScope.currentPlayer = player;

		game.players.push(player);

	}


	$scope.deleteGame = function(game) {
		$http.
		delete ('/api/games/' + game._id).success(function() {
			$http.get('/api/games').success(function(games) {
				$scope.games = games;
			});

		});
	}
	
	$scope.watchGame = function(game) {

		$location.path('/games/' + game._id);
	};
	
	$scope.joinGame = function(game) {

		initPlayer(game);

		$http.put('/api/games/' + game._id, game).success(function(data) {
			$location.path('/games/' + game._id + '/join');
		});

	};

	$scope.newGame = function() {

		var game = {};
		game.version = 0;
		game.status = 'created';
		game.name = $scope.selectedOptions.name;
		game.boardSize = $scope.selectedOptions.boardSize;
		game.bagSize = $scope.selectedOptions.bagSize.label;
		game.players = [];

		initBag(game);
		initBoard(game);
		initPlayer(game);

		$http.post('/api/games', game).success(function(data) {
			$location.path('/games/' + data._id + '/join');
		});

	};

	function processWords(data) {
		$rootScope.words = data.match(/[^\r\n]+/g);
		$scope.utilities.findLetterDist($rootScope.words);
	}

});
