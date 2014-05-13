$(function() {
  var loader = {
    repos: undefined,
    commits: undefined,
    getRepos: function() {
      return this.repos;
    },
    getCommits: function() {
      return this.commits;
    },
    loadRepos: function() {
      var that = this;
      return $.ajax({
        type: 'GET',
        url: '/repos',
        success: function(res) {
          that.repos = res[0];
        },
        error: function() {
        }
      });
    },
    loadCommits: function(repositoryName) {
      var that = this;
      return $.ajax({
        type: 'GET',
        url: '/commits',
        data: {name: repositoryName},
        success: function(res) {
          console.dir(res);
          that.commits = res[0];
        },
        error: function() {
        }
      });
    }
  };
  var scroller = {
    repoName: undefined,
    commits: undefined,
    commitCount: undefined,
    developer: undefined,
    intervalIds : [],
    setRepoName: function(name) {
      this.repoName = name;
    },
    setCommits: function(commits) {
      this.commits = commits;
    },
    analyze: function() {
      var commiterCounter = {}
      $.each(this.commits, function(i, commit) {
        var committer = commit.committer;
        if (commiterCounter[committer.raw_name] === undefined) {
          commiterCounter[committer.raw_name] = 1;
        } else {
          commiterCounter[committer.raw_name]++;
        }
      });
      this.developer = commiterCounter;
      this.commitCount = this.commits.length;
    },
    playMusic: function() {
      var songs = ['wNtX8HhsJ0E', 'nEbFnkzF1gU', 'iVu8PQ1eFWk'];
      var randomIndex = Math.floor(Math.random() * songs.length);
      var params = { allowScriptAccess: "always" };
      var atts = { id: "player" };
      $('body').prepend('<div id="music-player"></div>');
      swfobject.embedSWF('http://www.youtube.com/v/' + songs[randomIndex] + '?enablejsapi=1&playerapiid=player',
          'music-player', '250', '50', '8', null, null, params, atts);
    },
    scroll: function() {
      var $screen = $('#screen');
      var $stopButton = $('#stop-button');
      var commitsLength = this.commits.length;

      $stopButton.removeClass('inactive');
      this.playMusic();
      var prev = (function() {var d = new $.Deferred; d.resolve(); return d.promise();})();
      for (var i = 0; i < commitsLength; i++) {
        prev = prev.then(doScrollCommitLog(this.commits[i], this.intervalIds));
      }
      prev.then(function() {
        var $lastCommit = $('.commit:last');
        var endJudgeIntervalId = setInterval(function() {
          if (!$('.commit:last').length) {
            $('#user-info').fadeIn(1500);
            $('#repositories').fadeIn(1500);
            $('#login-form').fadeIn(1500);
            $('#description').fadeIn(1500);
            $stopButton.addClass('inactive');
            clearInterval(endJudgeIntervalId);
            stopPlayer();
          }
        }, 500);
      });

      function doScrollCommitLog(commit, intervalIds) {
        return function() {
          var $commit = $('<div class="commit">' + commit.message + '</div>');
          var movement = -50;
          var d = new $.Deferred;

          $commit.css({bottom: movement + 'px'});
          var initIntervalId = setInterval(function() {
            intervalIds.push(initIntervalId);
            var $last = $('.commit:last');
            var bottom = $last.length !== 0 ? $last.css('bottom').replace('px', '') : undefined;
            if ($last && bottom < 0) {
              return;
            } else {
              $screen.append($commit);
              clearInterval(initIntervalId);
              d.resolve();
            }
            var scrollIntervalId = setInterval(function() {
              intervalIds.push(scrollIntervalId);
              movement += 2;
              $commit.css({bottom: movement + 'px'});
              if ($commit.offset().top < -30) {
                $commit.remove();
                clearInterval(scrollIntervalId);
              }
            }, 40);
          }, 100);

          return d.promise();
        };
      }
    },
    stop: function() {
      $('#stop-button').addClass('inactive');
      $.each(this.intervalIds, function(i, id) {
        clearInterval(id);
      });
      var $commits = $('.commit');
      $commits.fadeOut(1500, function() {
        $commits.remove();
        $('#user-info').fadeIn(1500);
        $('#repositories').fadeIn(1500);
        $('#login-form').fadeIn(1500);
        $('#description').fadeIn(1500);
      });
      stopPlayer();
      repoName = undefined;
      commits = undefined;
      commitCount = undefined;
      developer = undefined;
    }
  };

  loader.loadRepos().then(function() {
    var repos = loader.getRepos();
    var $repositories = $('#repositories ul');
    $.each(repos, function(i, repository) {
      var $repository = $('<li class="repo"><a href="javascript:void(0)">' + repository.name + '</a></li>');
      $repositories.append($repository);
    })
  });

  $('#repositories').on('click', '.repo a', function() {
    $('#user-info').fadeOut(2000);
    $('#repositories').fadeOut(2000);
    $('#login-form').fadeOut(2000);
    $('#description').fadeOut(2000);

    var repoName = $(this).text();
    loader.loadCommits(repoName).then(function() {
      scroller.setRepoName(repoName);
      scroller.setCommits(loader.getCommits());
      scroller.analyze();
      scroller.scroll();
    });
  });

  $(document).on('click', '#stop-button', function() {
    scroller.stop();
  });

  $("#social-button-container .twitter").socialbutton("twitter", {
      button : "horizontal",
      text : "GitHubのコミットログでエンディングロール「Git Ending」",
      url : "http://gited.net",
  }).width(95);

  $("#social-button-container .facebook").socialbutton("facebook_like", {
      button : "button_count",
      url : "http://gited.net",
  }).width(110);

  $("#social-button-container .hatena").socialbutton("hatena", {
      button : "standard",
      url : "http://gited.net",
      title : "picob",
  }).width(70);
});

// YouTubeプレイヤー自動再生用
function onYouTubePlayerReady(playerId) {
  var $player = $('#player');
  $player[0].setVolume(50);
  $player[0].playVideo();
}
function stopPlayer() {
  var $player = $('#player');
  var volume = $player[0].getVolume();
  var stopInterval = setInterval(function() {
    if ($player[0] && volume <= 0) {
      clearInterval(stopInterval);
      $player.remove();
    }
    $player[0].setVolume(volume--);
  }, 40);
}
