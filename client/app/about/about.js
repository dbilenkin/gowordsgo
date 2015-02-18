'use strict';

angular.module('livewordsApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        templateUrl: 'app/about/about.html',
        controller: 'AboutCtrl'
      });
  });
