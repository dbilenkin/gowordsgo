'use strict';

angular.module('livewordsApp')
  .controller('UsersCtrl', function ($scope, $http) {
    
    $scope.users = [];

    $http.get('/api/users').success(function(users) {
      $scope.users = users;
    });
    
  });
