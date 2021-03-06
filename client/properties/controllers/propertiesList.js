angular.module("socially").controller("PropertiesListCtrl", ['$scope', '$meteor', '$rootScope', '$state',
  function($scope, $meteor, $rootScope, $state){

    $scope.page = 1;
    $scope.perPage = 3;
    $scope.sort = { name: 1 };
    $scope.orderProperty = '1';

    $scope.users = $meteor.collection(Meteor.users, false).subscribe('users');
    
    $scope.properties = $meteor.collection(function() {
      return Properties.find({}, {
        sort : $scope.getReactively('sort')
      });
    });

    $meteor.autorun($scope, function() {
      $meteor.subscribe('properties', {
        limit: parseInt($scope.getReactively('perPage')),
        skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.getReactively('perPage')),
        sort: $scope.getReactively('sort')
      }, $scope.getReactively('search')).then(function() {
        $scope.propertiesCount = $meteor.object(Counts ,'numberOfProperties', false);

        $scope.properties.forEach( function (property) {
          property.onClicked = function () {
            $state.go('propertyDetails', {propertyId: property._id});
          };
        });

        $scope.map = {
          center: {
            latitude: -37.81,
            longitude: 144.95
          },
          zoom: 8
        };

	
      });
    });




    $scope.remove = function(property){
      $scope.properties.splice( $scope.properties.indexOf(property), 1 );
    };

    $scope.pageChanged = function(newPage) {
      $scope.page = newPage;
    };

    $scope.$watch('orderProperty', function(){
      if ($scope.orderProperty)
        $scope.sort = {name: parseInt($scope.orderProperty)};
    });

    $scope.getUserById = function(userId){
      return Meteor.users.findOne(userId);
    };

    $scope.creator = function(property){
      if (!property)
        return;
      var owner = $scope.getUserById(property.owner);
      if (!owner)
        return "nobody";

      if ($rootScope.currentUser)
        if ($rootScope.currentUser._id)
          if (owner._id === $rootScope.currentUser._id)
            return "me";

      return owner;
    };

    $scope.rsvp = function(propertyId, rsvp){
      $meteor.call('rsvp', propertyId, rsvp).then(
        function(data){
          console.log('success responding', data);
        },
        function(err){
          console.log('failed', err);
        }
      );
    };
}]);
