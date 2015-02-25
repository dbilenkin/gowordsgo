'use strict';

angular.module('livewordsApp')
  .config(function ($routeProvider) {
    $routeProvider
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
							var specialSquare =Livewords.utilities.getSpecialSquare([i,j]);
							if (specialSquare) {
								$('#board').find('tr').eq(i).find('td').eq(j).addClass( "special " + specialSquare );
							}
						}
					}
	            }
	            timer(drawSquares, 0);
           }
           
           var viewportHeight = $(window).height();
           var viewportWidth = $(window).width();
           $('.board-container').height(viewportHeight - 250);
           $('.board-container').width(viewportWidth);
        });

    };
  }]);
