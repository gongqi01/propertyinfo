angular.module("socially").filter('uninvited', function () {
  return function (users, property) {
    if (!property)
      return false;

    return _.filter(users, function (user) {
      if (user._id == property.owner ||
        _.contains(property.invited, user._id))
        return false;
      else
        return true;
    });
  }
});
