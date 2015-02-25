'use strict';

angular.module('livewordsApp').controller('MainCtrl', function($rootScope, $scope, $location, $http, socket, Auth) {

	$scope.words = [];
	$scope.utilities = Livewords.utilities;

	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.getCurrentUser = Auth.getCurrentUser;

	$http.get('/api/games').success(function(games) {
		$scope.games = games;
		socket.syncUpdates('game', $scope.games);
	});

	$http.get('assets/twl06.txt').success(function(data) {
		processWords(data);
	});

	function initBag(game) {
		game.bag = [];
		$scope.utilities.initBag(game.bag);

	}

	function initBoard(game) {
		game.board = [];
		for (var i = 0; i < 15; i++) {
			game.board[i] = [];
			for (var j = 0; j < 15; j++) {
				game.board[i][j] = [];
			}
		}

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

		player.playerNumber = playerNumber;
		player.score = 0;
		$rootScope.currentPlayer = player;

		game.players.push(player);

	}


	$scope.deleteGame = function(game) {
		$http.delete('/api/games/' + game._id).success(function() {
			$http.get('/api/games').success(function(games) {
				$scope.games = games;
			});

		});
	}

	$scope.joinGame = function(game) {

		initPlayer(game);
		
		$http.put('/api/games/' + game._id, game).success(function(data) {
			socket.syncUpdatesObject('game', $scope.game, function(event, updatedGame) {
				$scope.game = updatedGame;
			});
			$location.path('/games/' + game._id);
		});

		

	};

	$scope.newGame = function() {

		var game = {};
		game.players = [];

		initBag(game);
		initBoard(game);
		initPlayer(game);

		$http.post('/api/games', game).success(function(data) {
			$location.path('/games/' + data._id);
		});

	};

	function processWords(data) {
		$rootScope.words = data.split('\n');
	}

});
