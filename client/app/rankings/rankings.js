'use strict';

angular.module('livewordsApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/rankings', {
        templateUrl: 'app/rankings/rankings.html',
        controller: 'RankingsCtrl'
      });
  });
