'use strict';

angular.module('livewordsApp').config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl : 'app/main/main.html',
		controller : 'MainCtrl'
	});
})

.run(function(Auth, $location) {

	Auth.isLoggedInAsync(checkLogin);
	//now redirect to appropriate path based on login status
	
	function checkLogin(loggedIn) {
		if (loggedIn) {
			$location.path('/');
		} else {
			$location.path('/login');
		}
	}
	
});
