/*
 * GET home page.
 */

exports.list = function(req, res){
  res.render('program', { title: 'LightControl' });
};
