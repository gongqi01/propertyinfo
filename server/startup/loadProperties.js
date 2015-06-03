Meteor.startup(function () {
  if (Properties.find().count() === 0) {
    var properties = [
      {'name': 'FLETCHERS',
	'price': '$600, 000+',
        'description': '3/762 Station Street Box Hill Vic 3128, this stylish town residence reflects quality design and generous modern spaces. '},
      {'name': 'Mandy Lee',
	'price': '$450, 000',
        'description': '1/20 Albion Road Box Hill Vic 3128, Central Location and Lifestyle'},
      {'name': 'RT Edgar',
	'price': 'Auction',
        'description': '7 Meadowbank Avenue Doncaster Vic 3108.'}
    ];
    for (var i = 0; i < properties.length; i++)
      Properties.insert({name: properties[i].name, price: properties[i].price, description: properties[i].description});
  }
});
