Meteor.publish("properties", function (options, searchString) {
  if (searchString == null)
    searchString = '';

  Counts.publish(this, 'numberOfProperties', Properties.find({
    'name' : { '$regex' : '.*' + searchString || '' + '.*', '$options' : 'i' },
    $or:[
      {$and:[
        {"public": true},
        {"public": {$exists: true}}
      ]},
      {$and:[
        {owner: this.userId},
        {owner: {$exists: true}}
      ]},
      {$and:[
        {invited: this.userId},
        {invited: {$exists: true}}
      ]}
    ]}), { noReady: true });
  return Properties.find({
    'name' : { '$regex' : '.*' + searchString || '' + '.*', '$options' : 'i' },
    $or:[
      {$and:[
        {"public": true},
        {"public": {$exists: true}}
      ]},
      {$and:[
        {owner: this.userId},
        {owner: {$exists: true}}
      ]},
      {$and:[
        {invited: this.userId},
        {invited: {$exists: true}}
      ]}
    ]} ,options);
});
