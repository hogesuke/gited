const async = require('async')
const GitHubApi = require('node-github')

exports.index = (req, res) => {
  const loginUser = req.session.passport.user
  res.render('index', {
    name: loginUser.raw_name,
    userType: loginUser.type
  })
}

exports.repos = (req, res) => {
  const loginUser = req.session.passport.user
  const perPage = 100
  const github = new GitHubApi({
    version: '3.0.0',
    timeout: 5000
  })

  const getReposRequester = (pageNo, repos) => {
    const func = next => {
      github.repos.getAll({
        type: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: perPage,
        page: pageNo
      }, (err, result) => {
        if (err) {
          console.dir(err)
          next(err)
        }

        for (let i = 0; i < result.length; i++) {
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
  }

  github.authenticate({
    type: 'oauth',
    token: loginUser.token
  })

  async.series([getReposRequester(0, [])], (err, repos) => {
    if (!repos) {
      res.send('error occurred.')
      return
    }
    res.send(repos)
  })
}

exports.commits = (req, res) => {
  const loginUser = req.session.passport.user
  const repositoryName = req.query.name
  const perPage = 100
  const github = new GitHubApi({
    version: '3.0.0',
    timeout: 5000
  })

  const getCommitsRequester = (pageNo, commits) => {
    const func = next => {
      github.repos.getCommits({
        user: loginUser.raw_name,
        repo: repositoryName,
        per_page: perPage,
        page: pageNo
      }, (err, result) => {
        if (err) {
          next(err)
          return
        }

        for (let i = 0; i < result.length; i++) {
          const commit = result[i].commit
          const committer = result[i].committer
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
  }

  github.authenticate({
    type: 'oauth',
    token: loginUser.token
  })

  async.series([getCommitsRequester(0, [])], (err, commits) => {
    if (!commits) {
      res.send('error occurred.')
      return
    }
    res.send(commits)
  })
}
