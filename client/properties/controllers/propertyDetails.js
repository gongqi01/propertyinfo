angular.module("socially").controller("PropertyDetailsCtrl", ['$scope', '$stateParams', '$meteor',
  function($scope, $stateParams, $meteor){

    $scope.property = $meteor.object(Properties, $stateParams.propertyId);

    var subscriptionHandle;
    $meteor.subscribe('properties').then(function(handle) {
      subscriptionHandle = handle;
    });

    $scope.users = $meteor.collection(Meteor.users, false).subscribe('users');

    $scope.invite = function(user){
      $meteor.call('invite', $scope.property._id, user._id).then(
        function(data){
          console.log('success inviting', data);
        },
        function(err){
          console.log('failed', err);
        }
      );
    };

    $scope.$on('$destroy', function() {
      subscriptionHandle.stop();
    });
    
    $scope.canInvite = function (){
        if (!$scope.property)
          return false;
  
        return !$scope.property.public &&
          $scope.property.owner === Meteor.userId();
    };

    $scope.map = {
      center: {
        latitude: -37.81,
        longitude: 144.95
      },
      zoom: 8,
      events: {
        click: function (mapModel, eventName, originalEventArgs) {
          if (!$scope.property)
            return;

          if (!$scope.property.location)
            $scope.property.location = {};

          $scope.property.location.latitude = originalEventArgs[0].latLng.lat();
          $scope.property.location.longitude = originalEventArgs[0].latLng.lng();
          //scope apply required because this event handler is outside of the angular domain
          $scope.$apply();
        }
      },
      marker: {
        options: { draggable: true },
        events: {
          dragend: function (marker, eventName, args) {
            if (!$scope.property.location)
              $scope.property.location = {};

            $scope.property.location.latitude = marker.getPosition().lat();
            $scope.property.location.longitude = marker.getPosition().lng();
          }
        }
      }
    };

  }]);
