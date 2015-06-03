angular.module("socially").run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$stateChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireUser promise is rejected
    // and redirect the user back to the main page
    if (error === "AUTH_REQUIRED") {
      $location.path("/properties");
    }
  });
}]);

angular.module("socially").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function($urlRouterProvider, $stateProvider, $locationProvider){

    $locationProvider.html5Mode(true);

    $stateProvider
      .state('properties', {
        url: '/properties',
        templateUrl: 'client/properties/views/properties-list.ng.html',
        controller: 'PropertiesListCtrl'
      })
      .state('propertyDetails', {
        url: '/properties/:propertyId',
        templateUrl: 'client/properties/views/property-details.ng.html',
        controller: 'PropertyDetailsCtrl',
        resolve: {
          "currentUser": ["$meteor", function($meteor){
            return $meteor.requireUser();
          }]
        }
      });

    $urlRouterProvider.otherwise("/properties");
  }]);
