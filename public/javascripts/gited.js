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
    windowHeight: undefined,
    repoName: undefined,
    commits: undefined,
    commitCount: undefined,
    developer: undefined,
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
      var params = { allowScriptAccess: "always" };
      var atts = { id: "player" };
      swfobject.embedSWF("http://www.youtube.com/v/wNtX8HhsJ0E?enablejsapi=1&playerapiid=player",
          "music-player", "250", "75", "8", null, null, params, atts);

    },
    scroll: function() {
      var $screen = $('#screen');
      var commitsLength = this.commits.length;

      this.playMusic();

      var prev = (function() {var d = new $.Deferred; d.resolve(); return d.promise();})();
      for (var i = 0; i < commitsLength; i++) {
        prev = prev.then(doScrollCommitLog(this.commits[i]));
      }
      prev.then();

      function doScrollCommitLog(commit) {
        return function() {
          var $commit = $('<div class="commit">' + commit.message + '</div>');
          var movement = -50;
          var d = new $.Deferred;

          $commit.css({bottom: movement + 'px'});
          var initIntervalId = setInterval(function() {
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

      // TODO 実装途中
      //function doScrollDeveloper(dev) {
      //  return function() {
      //    var $commit = $('<div class="developer">' + dev. + '</div>');
      //    var movement = -50;
      //    var d = new $.Deferred;

      //    $commit.css({bottom: movement + 'px'});
      //    var initIntervalId = setInterval(function() {
      //      var $last = $('.commit:last');
      //      var bottom = $last.length !== 0 ? $last.css('bottom').replace('px', '') : undefined;
      //      if ($last && bottom < 0) {
      //        return;
      //      } else {
      //        $screen.append($commit);
      //        clearInterval(initIntervalId);
      //        d.resolve();
      //      }
      //      var scrollIntervalId = setInterval(function() {
      //        movement += 2;
      //        $commit.css({bottom: movement + 'px'});
      //        if ($commit.offset().top < -30) {
      //          $commit.remove();
      //          clearInterval(scrollIntervalId);
      //        }
      //      }, 40);
      //    }, 100);

      //    return d.promise();
      //  }
      //}
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
    var repoName = $(this).text();
    loader.loadCommits(repoName).then(function() {
      scroller.setRepoName(repoName);
      scroller.setCommits(loader.getCommits());
      scroller.analyze();
      scroller.scroll();
    });
  });

});

// YouTubeプレイヤー自動再生用
function onYouTubePlayerReady(playerId) {
  var player = document.getElementById("player");
  player.playVideo();
}
