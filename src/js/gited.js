import '@/style/gited.scss'
import superagent from 'superagent'

class Loader {
  loadRepos () {
    return superagent
      .get('/repos')
      .then(res => res.body[0])
  }

  loadCommits (repositoryName) {
    return superagent
      .get('/commits')
      .query({ name: repositoryName })
      .then(res => res.body[0])
  }
}

class Scroller {
  constructor () {
    this.repoName = undefined
    this.commits = undefined
    this.commitCount = undefined
    this.developer = undefined
    this.intervalIds = []
  }

  setRepoName (name) {
    this.repoName = name
  }

  setCommits (commits) {
    this.commits = commits
  }

  analyze () {
    const commiterCounter = {}
    $.each(this.commits, (i, commit) => {
      const committer = commit.committer
      if (commiterCounter[committer.raw_name] === undefined) {
        commiterCounter[committer.raw_name] = 1
      } else {
        commiterCounter[committer.raw_name]++
      }
    })
    this.developer = commiterCounter
    this.commitCount = this.commits.length
  }

  playMusic () {
    const songs = ['nEbFnkzF1gU', 'iVu8PQ1eFWk']
    const randomIndex = Math.floor(Math.random() * songs.length)
    const params = { allowScriptAccess: 'always' }
    const atts = { id: 'player' }
    $('body').prepend('<div id="music-player"></div>')
    swfobject.embedSWF('http://www.youtube.com/v/' + songs[randomIndex] + '?enablejsapi=1&playerapiid=player',
      'music-player', '250', '50', '8', null, null, params, atts)
  }

  scroll () {
    const $stopButton = $('#stop-button')
    const commitsLength = this.commits.length

    $stopButton.removeClass('inactive')
    this.playMusic()
    let prev = (() => { const d = new $.Deferred(); d.resolve(); return d.promise() })()
    for (let i = 0; i < commitsLength; i++) {
      prev = prev.then(this.scrollCommitLog(this.commits[i], this.intervalIds))
    }
    prev.then(() => {
      const endJudgeIntervalId = setInterval(() => {
        if (!$('.commit:last').length) {
          $('#user-info').fadeIn(1500)
          $('#repositories').fadeIn(1500)
          $('#login-form').fadeIn(1500)
          $('#description').fadeIn(1500)
          $('body').removeClass('dark')
          $stopButton.addClass('inactive')
          clearInterval(endJudgeIntervalId)
          // TODO: YouTubeプレイヤーを復活させる場合は、もとに戻す
          // stopPlayer()
        }
      }, 500)
    })
  }

  scrollCommitLog (commit, intervalIds) {
    const $screen = $('#screen')

    return () => {
      const $commit = $('<div class="commit">' + commit.message + '</div>')
      let movement = -50
      const d = new $.Deferred()

      $commit.css({ bottom: movement + 'px' })
      const initIntervalId = setInterval(() => {
        intervalIds.push(initIntervalId)
        const $last = $('.commit:last')
        const bottom = $last.length !== 0 ? $last.css('bottom').replace('px', '') : undefined
        if ($last && bottom < 0) {
          return
        } else {
          $screen.append($commit)
          clearInterval(initIntervalId)
          d.resolve()
        }
        const scrollIntervalId = setInterval(() => {
          intervalIds.push(scrollIntervalId)
          movement += 2
          $commit.css({ bottom: movement + 'px' })
          if ($commit.offset().top < -30) {
            $commit.remove()
            clearInterval(scrollIntervalId)
          }
        }, 40)
      }, 100)

      return d.promise()
    }
  }

  stop () {
    $('#stop-button').addClass('inactive')
    $.each(this.intervalIds, (i, id) => {
      clearInterval(id)
    })
    const $commits = $('.commit')
    $commits.fadeOut(1500, () => {
      $commits.remove()
      $('#user-info').fadeIn(1500)
      $('#repositories').fadeIn(1500)
      $('#login-form').fadeIn(1500)
      $('#description').fadeIn(1500)
      $('body').removeClass('dark')
    })
    // TODO: YouTubeプレイヤーを復活させる場合は、もとに戻す
    // stopPlayer()
    this.repoName = undefined
    this.commits = undefined
    this.commitCount = undefined
    this.developer = undefined
  }
}

$(() => {
  const loader = new Loader()
  const scroller = new Scroller()

  loader.loadRepos().then(repos => {
    const $repositories = $('#repositories ul')
    $.each(repos, (i, repository) => {
      const $repository = $(`
        <li class="repo">
          <a class="name" href="javascript:void(0)">${repository.name}</a>
          <p class="description">${repository.description}</p>
          <div class="contributors">
            <img class="avater" src="${repository.owner.avatar_url}">
          </div>
        </li>
      `)
      $repositories.append($repository)
    })
  })

  $('#repositories').on('click', '.repo a', function () {
    $('#user-info').fadeOut(2000)
    $('#repositories').fadeOut(2000)
    $('#login-form').fadeOut(2000)
    $('#description').fadeOut(2000)
    $('body').addClass('dark')

    const repoName = $(this).text()
    loader.loadCommits(repoName).then(commits => {
      scroller.setRepoName(repoName)
      scroller.setCommits(commits)
      scroller.analyze()
      scroller.scroll()
    })
  })

  $(document).on('click', '#stop-button', () => {
    scroller.stop()
  })

  $('#social-button-container .twitter').socialbutton('twitter', {
    button: 'horizontal',
    text: 'GitHubのコミットログでエンディングロール「Git Ending」',
    url: 'http://gited.net'
  }).width(95)

  $('#social-button-container .facebook').socialbutton('facebook_like', {
    button: 'button_count',
    url: 'http://gited.net'
  }).width(110)

  $('#social-button-container .hatena').socialbutton('hatena', {
    button: 'standard',
    url: 'http://gited.net',
    title: 'picob'
  }).width(70)
})

// YouTubeプレイヤー自動再生用
const onYouTubePlayerReady = playerId => {
  const $player = $('#player')
  $player[0].setVolume(50)
  $player[0].playVideo()
}
const stopPlayer = () => {
  const $player = $('#player')
  let volume = $player[0].getVolume()
  const stopInterval = setInterval(() => {
    if ($player[0] && volume <= 0) {
      clearInterval(stopInterval)
      $player.remove()
    }
    $player[0].setVolume(volume--)
  }, 40)
}
