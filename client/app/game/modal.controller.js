angular.module('livewordsApp').controller('ErrorModalInstanceCtrl', function($scope, $modalInstance, error) {

	$scope.ok = function() {
		$modalInstance.close();
	};

	$scope.error = error;

});

angular.module('livewordsApp').controller('GameModalInstanceCtrl', function($rootScope, $scope, $modalInstance, options) {

	$scope.selected = {};

	$scope.create = function() {
		$modalInstance.close($scope.selected);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
	var index = Math.floor(Math.random() * $rootScope.words.length);
	$scope.selected.name = $rootScope.words[index];

	$scope.boardSizes = options.boardSizes;
	$scope.bagSizes = options.bagSizes;

	$scope.selected.boardSize = $scope.boardSizes[2];
	$scope.selected.bagSize = $scope.bagSizes[0];

}); 