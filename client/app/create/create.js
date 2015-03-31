'use strict';

angular.module('livewordsApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/create', {
        templateUrl: 'app/create/create.html',
        controller: 'CreateCtrl'
      });
  });
