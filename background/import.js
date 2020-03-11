
console.log('import.js')
var listsDone = pagesAll = pageNr = 0;
var serviceStatus = {
  'f': {
    'stop': false,
    'busy': false,
  },
  'h': {
    'stop': false,
    'busy': false,
  },
  'n': {
    'stop': true,
    'busy': false,
  }
}

// serviceStatus.n.stop = false;


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "listaFilmowUpdate") {
    console.log('--------------- listaFilmowUpdate');
    // let rodzajeList = ["films", "serials", "wantToSee"]
    let rodzajeList = ["films"]
    listaFilmowUpdate(rodzajeList)
  }
});



function listaFilmowUpdate(rodzajeList = ["films", "serials", "wantToSee"]) {
  // chrome.runtime.sendMessage({type: "createRefreshBtn", wczytywanie: true});
  // chrome.tabs.sendMessage({type: "createRefreshBtn", wczytywanie: true});
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: "createRefreshBtn", wczytywanie: true });

    chrome.storage.sync.get(function (sync) {
      var listsAll = rodzajeList.length;

      // chrome.storage.local.get(function (local) {
      //   console.log('listaFilmowUpdate --------- local')
      //   console.log(local);

        //  var jsonString= JSON.stringify(obj);
        let filmwebURL = 'https://www.filmweb.pl/user/' + encodeURIComponent(sync.config.login.split(" ").join("+"));

        $.each(rodzajeList, function (key, rodzajListy) {
          // console.log(rodzajListy);

          $.get(filmwebURL + '/' + encodeURIComponent(rodzajListy), function (dataP1) {
            console.log(filmwebURL + '/' + rodzajListy);
            console.log(dataP1);

            // var pagesCount = $(dataP1).find('section[data-pages-count]').data("pages-count");
            var pagesCount = 1; // TEST
            console.log('[' + rodzajListy + '] Stron: ' + pagesCount);
            pagesAll += pagesCount;
            ++listsDone;

            // $.extend(true, local, listaFilmowNowyRekord(dataP1, rodzajListy));
            listaFilmowNowyRekord(dataP1, rodzajListy);
            // console.log(listaFilmowNowyRekord(dataP1, rodzajListy));
            console.log(rodzajListy + ' AJAX Strona: 1/' + pagesCount);

            ++pageNr;
            chrome.tabs.sendMessage(tabs[0].id, { type: "createRefreshProgress", progress: { listsDone: listsDone, listsAll: listsAll, pageNr: pageNr, pagesAll: pagesAll } });

            var timeoutVar = 0;
            for (let pageNR = 2; pageNR <= pagesCount; pageNR++) {
              timeoutVar = Math.ceil(pageNr / 4) * 6;//60;
              timeoutVar = (timeoutVar < 600) ? Math.ceil(pageNr / 4) * 180 : 1000;//60;
              console.log('timeoutVar: '+timeoutVar)       
              window.setTimeout(function () {
                $.get(filmwebURL + '/' + rodzajListy + '?page=' + pageNR, function (dataP2) {
                  console.log(filmwebURL + '/' + rodzajListy + '?page=' + pageNR);
                  console.log(dataP2);

                  if (listsDone === listsAll) console.log(rodzajListy + ' AJAX Strona: ' + pageNr + '/' + pagesAll);
                  else console.log('[' + rodzajListy + '] AJAX Strona: ' + pageNr + '/ ?');

                  // $.extend(true, local, listaFilmowNowyRekord(dataP2, rodzajListy));
                  listaFilmowNowyRekord(dataP2, rodzajListy);
                  // console.log(listaFilmowNowyRekord(dataP1, rodzajListy));
                  //              listaFilmowNowyRekord(dataP2,rodzajListy);
                  //            console.log('pageNr: '+pageNr+' | pagesCount: '+pagesCount);
                  ++pageNr;
                  chrome.tabs.sendMessage(tabs[0].id, { type: "createRefreshProgress", progress: { listsDone: listsDone, listsAll: listsAll, pageNr: pageNr, pagesAll: pagesAll } });
                });
              }, timeoutVar);
            }
          });
        });



      // });
    });
    // });
  });
}

function listaFilmowNowyRekord(data, rodzajListy) {
  // t - title
  // ot - original title
  // a - href (url)
  // g - gust
  // w - wantSee
  // wt - want see text
  // r - rate
  // ur - user rate
  // f - user favourite
  // c - user comment
  let toSave = {};
  let prefix = '';
  $(data).find('.userVotesPage__result').each(function () {
    //    console.log(this);
    let movie = {}
    let id = $(this).data("id");

    movie['t'] = $(this).find('.filmPreview__title').html();
    movie['ot'] = $(this).find('.filmPreview__originalTitle').html();
    movie['a'] = $(this).find('.filmPreview__link').attr("href");

    let $filmPreview = $(this).find('.filmPreview');
    if ($filmPreview.data("type") === 'SERIAL') movie['type'] = 's';
    else if ($filmPreview.data("type") === 'FILM') movie['type'] = 'f';
    movie['d'] = $filmPreview.data("release").toString().split("-")[0];

    if (rodzajListy == 'wantToSee') {
      movie['g'] = $(this).data("rec");
      movie['w'] = $(this).find('.wantToSeeRateBox').data("rate");
      movie['wt'] = $(this).find('.wantToSeeRateBox__message').html();

    } else { // oceny
      movie['r'] = $(this).find('.rateBox__rate').html();
      let userData = JSON.parse($(data).find('[data-source="userVotes"] #' + id).html());
      movie['ur'] = userData.r;
      movie['f'] = userData.f;
      movie['c'] = userData.c;
    }

    movie['id'] = {};
    if ($(this).find('.advertButton--netflix')[0]) {
      let idNetflix = /[^/]*$/.exec($(this).find('.advertButton--netflix a').attr('href'))[0]
      movie['id'].n = idNetflix

      prefix = getPrefix('netflix')
      toSave[prefix + idNetflix] = id
      chrome.storage.local.set(toSave)

    } else {
      getNetflixID(movie, id);
    }

    if ($(this).find('.advertButton--hbo')[0]) {
      let idHboGo = /[^/]*$/.exec($(this).find('.advertButton--hbo a').attr('href'))[0];
      movie['id'].h = idHboGo

      prefix = getPrefix('hbogo')
      toSave[prefix + idHboGo] = id
      chrome.storage.local.set(toSave)

    } else {
      yfomcGetHbogoID(movie, id);
    }

    //    console.log('movie');
    console.log('[tytuł] ' + movie['t']);

    //  chrome.runtime.sendMessage({type: "filmFilmweb", data: movie, id: id}, function (response) {
    //      console.log(response);
    //  });
    prefix = getPrefix('filmweb')
    toSave[prefix + id] = JSON.stringify(movie);
    chrome.storage.local.set(toSave);
    // chrome.storage.local.set(toSave, function () {
    //   console.log("local SAVED! (interface.js)");
    // });
  });
  return toSave;
}
