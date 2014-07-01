/*
 * GET home page.
 */

exports.list = function(req, res){
	  res.render('timer', { title: 'Timer'});
};
