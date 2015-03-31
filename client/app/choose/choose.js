'use strict';

angular.module('livewordsApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/choose', {
        templateUrl: 'app/choose/choose.html',
        controller: 'ChooseCtrl'
      });
  });
