'use strict';

angular.module('livewordsApp').controller('ChooseCtrl', function($rootScope, $scope, $location, $http, $modal, socket, Auth) {
	
	$scope.utilities = Livewords.utilities;

	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.getCurrentUser = Auth.getCurrentUser;



	$http.get('/api/games').success(function(games) {
		$scope.games = games;
		socket.syncUpdates('game', $scope.games, function(event, updatedGame, games) {
			$scope.games = games;
		});
	});

	$scope.createGame = function() {

		
	};
	
	

	
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
	
	
	$scope.joinGame = function(game) {

		initPlayer(game);
		Livewords.utilities.specialSquares = game.boardType;

		$http.put('/api/games/' + game._id, game).success(function(data) {
			$location.path('/games/' + game._id + '/join');
		});

	};



});
