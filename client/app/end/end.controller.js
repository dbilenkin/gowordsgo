'use strict';

angular.module('livewordsApp')
  .controller('EndCtrl', function ($scope, $routeParams, $http) {
  	
  	$scope.gameid = $routeParams.id;
    
    
    $http.get('/api/games/' + $scope.gameid).success(function(game) {
			$scope.game = game;
			$scope.game.players.sort(function(a,b) {
				return b.score - a.score;
			});
		});
  });
