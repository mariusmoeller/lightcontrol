/*
 * GET home page.
 */

exports.list = function(req, res){
	  res.render('labyrinth', { title: 'Labyrinth'});
};
