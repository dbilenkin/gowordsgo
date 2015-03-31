'use strict';

angular.module('livewordsApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/games/:id/join', {
        templateUrl: 'app/game/join.html',
        controller: 'JoinCtrl'
      })
      .when('/games/:id', {
        templateUrl: 'app/game/game.html',
        controller: 'GameCtrl'
      });
  })
  
   .directive('drawSpecialSquares', ['$timeout', function (timer) {

    return function (scope, element, attrs) {
        scope.$watch("game", function (value) {//I change here
            var val = value || null;            
            if (val) {
                var drawSquares = function () {
	                for (var i = 0; i < 15; i++) {
						for (var j = 0; j < 15; j++) {
							var specialSquare = Livewords.utilities.getSpecialSquare([i,j]);
							if (specialSquare) {
								$('#board div.board-row:nth-child('+(i+1)+') div.cell:nth-child('+(j+1)+')').addClass( "special " + specialSquare );
							}
							
							if (i == 7 && j == 7) {
								$('#board div.board-row:nth-child('+(i+1)+') div.cell:nth-child('+(j+1)+')').addClass('center-square');
							}
						}
					}
					
	            };
	            timer(drawSquares, 0);
           }
           
           
           
        });

    };
  }]);
