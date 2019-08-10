'use strict';

var async = require('async')
var GitHubApi = require('node-github')
var request = require('request')

exports.index = function (req, res) {
  var loginUser = req.session.passport.user
  res.render('index', {
    name: loginUser.raw_name,
    userType: loginUser.type
  })
};

exports.repos = function (req, res) {
  var loginUser = req.session.passport.user
  var perPage = 100
  var github = new GitHubApi({
    version: '3.0.0',
    timeout: 5000
  })

  var getReposRequester = function (pageNo, repos) {
    var func = function (next) {
      github.repos.getAll({
        type: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: perPage,
        page: pageNo
      }, function (err, result) {
        if (err) {
          console.dir(err)
          next(err)
        }

        for (var i = 0; i < result.length; i++) {
          repos.push(result[i])
        }

        // すべてのRepositoryを取得し終えた場合はオブジェクトを返却。
        // まだ続きがある場合は、再帰で取得を継続する。
        if (result.length === perPage) {
          pageNo++
          return func(next)
        }
        next(null, repos)
      })
    }
    return func
  };

  github.authenticate({
    type: 'oauth',
    token: loginUser.token
  })

  async.series([getReposRequester(0, [])], function (err, repos) {
    if (!repos) {
      res.send('error occurred.')
      return;
    }
    res.send(repos)
  })
}

exports.commits = function (req, res) {
  var loginUser = req.session.passport.user
  var repositoryName = req.query.name
  var perPage = 100
  var github = new GitHubApi({
    version: '3.0.0',
    timeout: 5000
  })

  var getCommitsRequester = function (pageNo, commits) {
    var func = function (next) {
      github.repos.getCommits({
        user: loginUser.raw_name,
        repo: repositoryName,
        per_page: perPage,
        page: pageNo
      }, function (err, result) {
        if (err) {
          console.dir(err)
          next(err)
        }

        for (var i = 0; i < result.length; i++) {
          var commit = result[i].commit
          var committer = result[i].committer
          commit.committer.id = committer.id
          commit.committer.raw_name = committer.login
          commits.push(commit)
        }

        // すべてのCommitを取得し終えた場合はオブジェクトを返却。
        // まだ続きがある場合は、再帰で取得を継続する。
        if (result.length === perPage) {
          pageNo++
          return func(next)
        }
        next(null, commits.reverse())
      })
    }
    return func
  };

  github.authenticate({
    type: 'oauth',
    token: loginUser.token
  })

  async.series([getCommitsRequester(0, [])], function (err, commits) {
    if (!commits) {
      res.send('error occurred.')
      return;
    }
    res.send(commits)
  })
};
