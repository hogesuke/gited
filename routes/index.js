"use strict";

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.login = function(req, res){
}

exports.commits = function(req, res){

  res.send({
    commits:[
      {
        author: "hogesuke",
        comment: "コミットコメント１"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント２"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント３"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント4"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント5"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント6"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント7"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント8"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント9"
      },
      {
        author: "hogesuke",
        comment: "コミットコメント10"
      }
    ]
  });
};
