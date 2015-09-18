(function () {
  'use strict';


  function getElementsByClassName(className, scope) {
    scope = scope || document;

    if (scope.getElementsByClassName) {
      return scope.getElementsByClassName(className) || [];
    }

    var all = scope.getElementsByTagName('*');
    var els = [];
    for (var k = all.length - 1; k >= 0; k -= 1) {
      var el = all[k];
      var c = el.getAttribute('class') || '';
      if (c.indexOf(className) >= 0) {
        els.push(el);
      }
    }
    return els;
  }



  function getMoviesInDom() {
    var els = getElementsByClassName('title_card');

    // If we're on a Kids page then the markup is different.
    if (!els || els.length === 0) {
      els = getElementsByClassName('agMovie');
    }

    return els;
  }

  function toVideoData(movieEl) {
    var className = movieEl.getAttribute('class');
    var id, title, artworkUrl;

    // Non-Kids pages (i.e. adult pages)
    if (className && className.indexOf('title_card') >= 0) {
      id = movieEl.getAttribute('id').split('-').pop();
      title = movieEl.getAttribute('aria-label');
      var artworkEl = getElementsByClassName('video-artwork', movieEl)[0];
      artworkUrl = artworkEl ? artworkEl.style.backgroundImage.substr(4).replace(')', '').replace(/'|"/g, '') : '';

    // Kids pages
    } else if (className && className.indexOf('agMovie') >= 0) {
      var boxShotEl = getElementsByClassName('boxShot', movieEl)[0];
      id = boxShotEl ? boxShotEl.getAttribute('id').split('_').shift().replace(/\D/g, '') : '';
      var img = movieEl.getElementsByTagName('img')[0];
      title = img ? img.getAttribute('alt') : '';
      artworkUrl = img ? img.getAttribute('src') : '';
    }

    return {
      id: id,
      title: title,
      artworkUrl: artworkUrl
    };
  }

  function chooseRandomVideoInDom(simulateClick) {
    var movieEls = getMoviesInDom();
    var k = Math.round(Math.random() * movieEls.length);
    var movieEl = movieEls[k];

    if (simulateClick && typeof movieEl.click === 'function') {
      // If there is a nested <a> element like there is in the Kids pages
      // then we simulate the click on that element.
      var anchor = movieEl.getElementsByTagName('a')[0];
      if (anchor) {
        anchor.click();
      } else {
        movieEl.click();
      }
    }

    return toVideoData(movieEl);
  }

  function installUi(options) {
    var header = document.getElementById('hdPinTarget');

    if (!header) {
      if (options.showOnKids) {
        // On the Kids page the markup is different.
        header = document.getElementById('hd');
      } else {
        // We are not showing on Kids section.
        return;
      }
    }

    if (header) {
      var liEls = header.getElementsByTagName('li');
      var anchor = document.createElement('a');
      anchor.setAttribute('href', '#');
      anchor.innerHTML = 'Random';
      var li = document.createElement('li');
      // Have to add the CSS class 'nav-item' for the Kids pages.
      li.setAttribute('class', 'randomflix nav-item is-hidden');
      li.appendChild(anchor);
      liEls[0].parentNode.appendChild(li);
      anchor.onclick = function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }

        chooseRandomVideoInDom(true);
      };

      setTimeout(function () {
        // Emphasis the UI by making it heavy (i.e. glow) and fade it in.
        li.setAttribute('class', 'randomflix nav-item randomflix--heavy');
        setTimeout(function () {
          // Demphasize the UI.
          li.setAttribute('class', 'randomflix nav-item');
        }, 260);
      }, 450);
    }
  }

  // Wait for the page to settle down before we add our UI.
  // If we don't wait then there are some cases where our UI
  // is removed from the header.
  setTimeout(function () {
    chrome.storage.sync.get({
      showOnKids: false
    }, function (options) {
      installUi(options);
    });
  }, 1000);

}());