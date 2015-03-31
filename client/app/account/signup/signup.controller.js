'use strict';

angular.module('livewordsApp').controller('SignupCtrl', function($scope, Auth, $location, $window) {

	


	
	function saveUser(picture) {
		Auth.createUser({
				name : $scope.user.name,
				email : $scope.user.email,
				password : $scope.user.password,
				picture : 'http://thisdogslife.co/wp-content/themes/this-dogs-life/images/dog-icon.png'
			}).then(function() {
				// Account created, redirect to home
				$location.path('/');
			}).catch(function(err) {
				err = err.data;
				$scope.errors = {};

				// Update validity of form fields that match the mongoose errors
				angular.forEach(err.errors, function(error, field) {
					form[field].$setValidity('mongoose', false);
					$scope.errors[field] = error.message;
				});
			});
	}


	$scope.user = {};
	$scope.errors = {};

	$scope.register = function(form) {
		$scope.submitted = true;

		if (form.$valid) {
			saveUser();
		}
	};

	$scope.loginOauth = function(provider) {
		$window.location.href = '/auth/' + provider;
	};
});
