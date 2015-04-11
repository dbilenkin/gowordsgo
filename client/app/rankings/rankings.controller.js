'use strict';

angular.module('livewordsApp')
  .controller('RankingsCtrl', function ($scope, $http) {
  	
  	$scope.utilities = Livewords.utilities;



	$http.get('/api/games').success(function(games) {
		$scope.games = games;
		
		var completedGames = [];
		
		for (var i = 0; i < games.length; i++) {
			
			if (games[i].status === 'over') {
				completedGames.push(games[i]);
			}
			
		}
		
		
		
		$scope.speedGames = completedGames.slice();
		$scope.scoreGames = completedGames.slice();
		
		$scope.speedGames.sort(function(a, b) {
			return new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime();
		});
		
		$scope.scoreGames.sort(function(a, b) {
			return b.players[b.winner].score - a.players[a.winner].score;
		});
	});

  });
