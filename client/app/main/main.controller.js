'use strict';

angular.module('livewordsApp').controller('MainCtrl', function($rootScope, $scope, $location, $http, $modal, socket, Auth) {
	
	$scope.utilities = Livewords.utilities;
	
	$http.get('assets/twl06.txt').success(function(data) {
		processWords(data);
	});
	
	$scope.singlePlayer = function() {
		$rootScope.singlePlayer = true;
		$location.path('/create');
	};
	
	$scope.multiPlayer = function() {
		$rootScope.singlePlayer = false;
		$location.path('/choose');
	};

	function processWords(data) {
		$rootScope.words = data.match(/[^\r\n]+/g);
		//$scope.utilities.findLetterDist($rootScope.words);
	}

});
