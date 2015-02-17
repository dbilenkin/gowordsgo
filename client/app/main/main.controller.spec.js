'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('dimaFunApp'));
  beforeEach(module('socketMock'));

  var MainCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/tiles')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of tiles to the scope', function () {
    $httpBackend.flush();
    //expect(scope.tiles.length).toBe(7);
  });
});
