'use strict';

angular.module('livewordsApp').controller('JoinCtrl', function($rootScope, $scope, $routeParams, $location, $http, $timeout, $modal, socket) {
	
	$scope.utilities = Livewords.utilities;
	
	$scope.gameid = $routeParams.id;
	$scope.isEveryoneReady = false;
	
	$scope.setPlayerColors = function() {
		$timeout(function() {
		
			for (var i = 0; i < $scope.game.players.length; i++) {
				var player = $scope.game.players[i];
				var options = {
				    color: player.color,
				    preferredFormat: "hex",
				    change: function(color) {
				    	var hex = $scope.utilities.rgbToHex(parseInt(color._r), parseInt(color._g), parseInt(color._b));
				        $scope.game.players[$rootScope.currentPlayer.number].color = hex;
				        $http.put('/api/games/' + $scope.game._id, $scope.game);
				    }
				};
				if ($rootScope.currentPlayer.number != player.number) {
					options.disabled = true;
				}
				
				$("#colorpicker" + player.number).spectrum(options);	
				
			}
	
		}, 100);
		
	};
	
	

	$http.get('/api/games/' + $scope.gameid).success(function(game) {
		$scope.game = game;
		$scope.setPlayerColors();
		if ($scope.game.status == 'started') {
			$location.path('/games/' + $scope.gameid);
		} else {
			socket.syncUpdatesObject('game' + game._id, $scope.game, function(event, updatedGame) {
				$scope.setPlayerColors();
				var everyoneIsReady = true;
				for (var i = 0; i < updatedGame.players.length; i++) {
					if (!updatedGame.players[i].ready) {
						everyoneIsReady = false;
						break;
					}
				}
				$scope.isEveryoneReady = everyoneIsReady;
				$scope.game = updatedGame;
				if(updatedGame.status == 'started') {
					for (var i = 0; i < $scope.game.players.length; i++) {
						addPlayerCss($scope.game.players[i]);
					}
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
	
	function addPlayerCss(player) {
		var playerNumber = player.number;
		var rgbColor = $scope.utilities.hexToRgb(player.color);
		
		var r = rgbColor.r;
		var g = rgbColor.g;
		var b = rgbColor.b;
		
		var color = $scope.utilities.getForegroundColor(r, g, b);
		
		$('<style>.player' + playerNumber +
		'{ background-color: rgb('+ r + ',' + g + ',' + b + '); ' +
		' color: ' + color + '; }' +
		'</style>').appendTo('body');
	}

	

	$scope.startGame = function() {
		$scope.game.status = 'started';
		$scope.game.startTime = Date.now();
		
		for (var i = 0; i < $scope.game.players.length; i++) {
			addPlayerCss($scope.game.players[i]);
		}
		$http.put('/api/games/' + $scope.game._id, $scope.game).success(function(game) {
			$location.path('/games/' + $scope.gameid);
		});
		

	};

	
});
