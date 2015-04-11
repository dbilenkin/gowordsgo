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
  });
