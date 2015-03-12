'use strict';

angular.module('livewordsApp').controller('JoinCtrl', function($rootScope, $scope, $routeParams, $location, $http, $modal, socket) {
	
	$scope.gameid = $routeParams.id;
	$scope.isEveryoneReady = false;

	$http.get('/api/games/' + $scope.gameid).success(function(game) {
		$scope.game = game;
		if ($scope.game.status == 'started') {
			$location.path('/games/' + $scope.gameid);
		} else {
			socket.syncUpdatesObject('game' + game._id, $scope.game, function(event, updatedGame) {
				var everyoneIsReady = true;
				for (var i = 0; i < updatedGame.players.length; i++) {
					everyoneIsReady = updatedGame.players[i].ready;
				}
				$scope.isEveryoneReady = everyoneIsReady;
				$scope.game = updatedGame;
				if(updatedGame.status == 'started') {
					$location.path('/games/' + $scope.gameid);
				}
			});
		}
	});
	
		
	
	
	$scope.updateReady = function() {
		$http.put('/api/games/' + $scope.game._id, $scope.game);
	};
	
	$scope.isCreator = function() {
		if ($rootScope.currentPlayer) {
			return $rootScope.currentPlayer.number === 0;
		} else {
			return false;
		}
	};
	
	$scope.isCurrentPlayer = function(player) {
		if ($rootScope.currentPlayer) {
			return player.number === $rootScope.currentPlayer.number;
		} else {
			return false;
		}

	};

	

	$scope.startGame = function() {
		$scope.game.status = 'started';
		$http.put('/api/games/' + $scope.game._id, $scope.game).success(function(game) {
			$location.path('/games/' + $scope.gameid);
		});
		

	};

	
});
