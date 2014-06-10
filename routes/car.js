/*
 * GET home page.
 */

exports.list = function(req, res){
	  res.render('car', { title: 'Car Ralley'});
};
