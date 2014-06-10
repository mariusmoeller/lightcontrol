/*
 * GET home page.
 */

exports.list = function(req, res){
  res.render('pong', { title: 'LightControl' });
};
