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

    // let prev = (() => { const d = new $.Deferred(); d.resolve(); return d.promise() })()
    // for (let i = 0; i < commitsLength; i++) {
    //   prev = prev.then(this.scrollCommitLog(this.commits[i], this.intervalIds))
    // }
    // prev.then(() => {
    //   const endJudgeIntervalId = setInterval(() => {
    //     if (!$('.commit:last').length) {
    //       $('#user-info').fadeIn(1500)
    //       $('#repositories').fadeIn(1500)
    //       $('#login-form').fadeIn(1500)
    //       $('#description').fadeIn(1500)
    //       $stopButton.addClass('inactive')
    //       clearInterval(endJudgeIntervalId)
    //       // TODO: YouTubeプレイヤーを復活させる場合は、もとに戻す
    //       // stopPlayer()
    //     }
    //   }, 500)
    // })

    const $screen = $('#screen')

    const hoge = async () => {
      for (const commit of this.commits) {
        let movement = -50
        const $commit = $('<div class="commit">' + commit.message + '</div>').css({ bottom: movement + 'px' })

        $screen.append($commit)

        const scroll = () => {
          movement += 0.8
          $commit.css({ bottom: movement + 'px' })
          if ($commit.offset().top < -30) {
            $commit.remove()
          } else {
            requestAnimationFrame(scroll)
          }
        }
        requestAnimationFrame(scroll)

        console.log('before await')
        await new Promise((resolve, reject) => {
          // setTimeout(() => resolve(), 3000)
          const init = (entries, object) => {
            const entry = entries[0]
            if (entry.isIntersecting) {
              resolve()
              object.unobserve(entry.target)
            }
          }

          const observer = new IntersectionObserver(init, {
            rootMargin: '-15px',
            threshold: [0, 0.5, 1.0]
          })

          observer.observe($commit[0])
        })
        console.log('after await')
      }
    }

    hoge()
  }

  scrollCommitLog (commit, intervalIds) {
    const $screen = $('#screen')

    return () => {
      const $commit = $('<div class="commit">' + commit.message + '</div>')
      let movement = -50
      const d = new $.Deferred()

      $commit.css({ bottom: movement + 'px' })

      const init = (entries, object) => {
        // const $last = $('.commit:last')
        const entry = entries[0]
        // const bottom = $last.length !== 0 ? $last.css('bottom').replace('px', '') : undefined
        if (!entry.isIntersecting && $('.commit').length > 0) {
          console.log('coco')
          return
        } else {
          console.log('gogo')

          if ($('.commit').length > 0) {
            console.log('unobserve')
            object.unobserve(entry.target)
          }

          $screen.append($commit)
          // clearInterval(initIntervalId)
          d.resolve()
        }

        const scroll = () => {
          movement += 0.8
          $commit.css({ bottom: movement + 'px' })
          if ($commit.offset().top < -30) {
            $commit.remove()
          } else {
            requestAnimationFrame(scroll)
          }
        }
        requestAnimationFrame(scroll)
      }

      const observer = new IntersectionObserver(init, {
        rootMargin: '10px 10px',
        threshold: [0, 0.5, 1.0]
      })

      observer.observe($commit[0])

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
      const $repository = $('<li class="repo"><a href="javascript:void(0)">' + repository.name + '</a></li>')
      $repositories.append($repository)
    })
  })

  $('#repositories').on('click', '.repo a', function () {
    $('#user-info').fadeOut(2000)
    $('#repositories').fadeOut(2000)
    $('#login-form').fadeOut(2000)
    $('#description').fadeOut(2000)

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
