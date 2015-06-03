Properties = new Mongo.Collection("properties");

Properties.allow({
  insert: function (userId, property) {
    return userId && property.owner === userId;
  },
  update: function (userId, property, fields, modifier) {
    if (userId !== property.owner)
      return false;

    return true;
  },
  remove: function (userId, property) {
    if (userId !== property.owner)
      return false;

    return true;
  }
});

Meteor.methods({
  invite: function (propertyId, userId) {
    check(propertyId, String);
    check(userId, String);
    var property = Properties.findOne(propertyId);
    if (!property)
      throw new Meteor.Error(404, "No such property");
    if (property.owner !== this.userId)
      throw new Meteor.Error(404, "No such property");
    if (property.public)
      throw new Meteor.Error(400,
        "That property is public. No need to invite people.");

    if (userId !== property.owner && ! _.contains(property.invited, userId)) {
      Properties.update(propertyId, { $addToSet: { invited: userId } });

      var from = contactEmail(Meteor.users.findOne(this.userId));
      var to = contactEmail(Meteor.users.findOne(userId));

      if (Meteor.isServer && to) {
        // This code only runs on the server. If you didn't want clients
        // to be able to see it, you could move it to a separate file.
        Email.send({
          from: "noreply@socially.com",
          to: to,
          replyTo: from || undefined,
          subject: "PARTY: " + property.title,
          text:
          "Hey, I just invited you to '" + property.title + "' on Socially." +
          "\n\nCome check it out: " + Meteor.absoluteUrl() + "\n"
        });
      }
    }
  },
  rsvp: function (propertyId, rsvp) {
    check(propertyId, String);
    check(rsvp, String);
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in to RSVP");
    if (! _.contains(['yes', 'no', 'maybe'], rsvp))
      throw new Meteor.Error(400, "Invalid RSVP");
    var property = Properties.findOne(propertyId);
    if (! property)
      throw new Meteor.Error(404, "No such property");
    if (! property.public && property.owner !== this.userId &&
      !_.contains(property.invited, this.userId))
    // private, but let's not tell this to the user
      throw new Meteor.Error(403, "No such property");

    var rsvpIndex = _.indexOf(_.pluck(property.rsvps, 'user'), this.userId);
    if (rsvpIndex !== -1) {
      // update existing rsvp entry

      if (Meteor.isServer) {
        // update the appropriate rsvp entry with $
        Properties.update(
          {_id: propertyId, "rsvps.user": this.userId},
          {$set: {"rsvps.$.rsvp": rsvp}});
      } else {
        // minimongo doesn't yet support $ in modifier. as a temporary
        // workaround, make a modifier that uses an index. this is
        // safe on the client since there's only one thread.
        var modifier = {$set: {}};
        modifier.$set["rsvps." + rsvpIndex + ".rsvp"] = rsvp;
        Properties.update(propertyId, modifier);
      }

      // Possible improvement: send email to the other people that are
      // coming to the property.
    } else {
      // add new rsvp entry
      Properties.update(propertyId,
        {$push: {rsvps: {user: this.userId, rsvp: rsvp}}});
    }
  }
});

var contactEmail = function (user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;
  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;
  return null;
};
