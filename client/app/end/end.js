'use strict';

angular.module('livewordsApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/games/:id/end', {
        templateUrl: 'app/end/end.html',
        controller: 'EndCtrl'
      });
  });
