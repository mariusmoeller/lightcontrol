/*
 * GET home page.
 */

exports.list = function(req, res){
  res.render('show', { title: 'LightControl' });
};
