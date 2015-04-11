'use strict';

angular.module('livewordsApp').controller('CreateCtrl', function($rootScope, $scope, $location, $http, $modal, socket, Auth) {
	
	$scope.utilities = Livewords.utilities;

	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.getCurrentUser = Auth.getCurrentUser;
	
	var boardTypes = Livewords.options.boardTypes;

	$scope.options = {
		boardTypes : [{
			type : boardTypes.classic,
			label : 'Classic distribution of special squares'
		}, {
			type : boardTypes.randomLots(),
			label : 'Lots of random special squares'
		}, {
			type : boardTypes.randomMedium(),
			label : 'Medium amount of random special squares'
		}, {
			type : boardTypes.randomFew(),
			label : 'A few random special squares'
		}, {
			type : boardTypes.none,
			label : 'No special squares'
		}],
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
			id : 6,
			label : 'DOG (for testing)'
		}]
	};
	
	$scope.selected = {};



	

	$scope.create = function() {
		$scope.newGame();
	};


	var index = Math.floor(Math.random() * $rootScope.words.length);
	$scope.selected.name = $rootScope.words[index];

	$scope.selected.boardType = $scope.options.boardTypes[0];
	$scope.selected.bagSize = $scope.options.bagSizes[0];


	function initBag(game) {
		var sizeIndex = $scope.selected.bagSize.id;
		game.bag = [];
		$scope.utilities.initBag(game.bag, sizeIndex);

	}

	function initBoard(game) {

		var size = 15;
		game.board = [];
		for (var i = 0; i < size; i++) {
			game.board[i] = [];
			for (var j = 0; j < size; j++) {
				game.board[i][j] = [];
			}
		}

	}
	
	
	function addPlayerColor(player) {
		var playerNumber = player.number;
		
		var r = Math.floor(Math.random() * 256);
		var g = Math.floor(Math.random() * 256);
		var b = Math.floor(Math.random() * 256);
		
		player.color = $scope.utilities.rgbToHex(r, g, b);
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
		player.firstName = player.name.split(' ')[0];
		
		game.updatedBy = playerNumber;
		addPlayerColor(player);
		
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
	};
	
	$scope.watchGame = function(game) {

		$location.path('/games/' + game._id);
	};
	
	$scope.joinGame = function(game) {

		initPlayer(game);
		Livewords.utilities.specialSquares = game.boardType;

		$http.put('/api/games/' + game._id, game).success(function(data) {
			$location.path('/games/' + game._id + '/join');
		});

	};

	$scope.newGame = function() {

		var game = {};
		game.version = 0;
		game.status = 'created';
		game.winner = -1;
		game.name = $scope.selected.name;
		game.boardType = $scope.selected.boardType.type;
		game.bagSize = $scope.selected.bagSize.label;
		game.players = [];
		
		Livewords.utilities.specialSquares = $scope.selected.boardType.type;

		initBag(game);
		initBoard(game);
		initPlayer(game);
		
		if ($rootScope.singlePlayer) {
			game.startTime = Date.now();
			game.status = 'started';
		}

		$http.post('/api/games', game).success(function(data) {
			if ($rootScope.singlePlayer) {
				$location.path('/games/' + data._id);
			} else {
				$location.path('/games/' + data._id + '/join');
			}
			
		});

	};


});
