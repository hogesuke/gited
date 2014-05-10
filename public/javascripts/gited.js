$(function() {
  var loader = {
    commits: undefined,
    getCommits: function() {
      return this.commits;
    },
    load: function() {
      var that = this;
      return $.ajax({
        type: 'GET',
        url: '/commits',
        success: function(res) {
          that.commits = res.commits;
        },
        error: function() {
        }
      });
    }
  };
  var scroller = {
    windowHeight: undefined,
    commits: undefined,
    init: function() {
    },
    setCommits: function(commits) {
      this.commits = commits;
    },
    scroll: function() {
      var $screen = $('#screen');
      var commitsLength = this.commits.length;

      var prev = (function() {var d = new $.Deferred; d.resolve(); return d.promise();})();
      for (var i = 0; i < commitsLength; i++) {
        prev = prev.then(doScroll(this.commits[i]));
      }

      function doScroll(commit) {
        return function() {
          var $commit = $('<div class="commit">' + commit.comment + '</div>');
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
    }
  };

  loader.load().then(function() {
    scroller.setCommits(loader.getCommits());
    scroller.scroll();
  });
});
