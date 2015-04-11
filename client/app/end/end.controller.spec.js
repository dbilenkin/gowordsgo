'use strict';

describe('Controller: EndCtrl', function () {

  // load the controller's module
  beforeEach(module('livewordsApp'));

  var EndCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EndCtrl = $controller('EndCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
