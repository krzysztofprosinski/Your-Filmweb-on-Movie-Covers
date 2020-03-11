/* Updates information about titles */
chrome.runtime.onMessage.addListener(function(r, sender, callback) {
  if(r.type=="createRefreshBtn"){
    console.log('------------ createRefreshBtn');
    if (r.wczytywanie === undefined || r.wczytywanie === null) r.wczytywanie = false;
    createRefreshBtn(r.wczytywanie);

  } else if(r.type=="createRefreshProgress"){
    console.log('------------ createRefreshProgress');
    createRefreshProgress(r.progress.listsDone, r.progress.listsAll, r.progress.pageNr, r.progress.pagesAll);
  }
});


// Menu
function prepareNavContainer() {
  let container;

  if (!$(".yfomc-nav")[0]) {
    if (service == 'netflix') {
      $('.secondary-navigation').addClass('yfomc-nav');

    } else if (service == 'hbogo') {
      $('.navbar-inline').prepend('<ul class="main-menu yfomc-nav yfomc-navbar-hbogo"></ul>');
    }
  }
  container = $(".yfomc-nav");

  return container;
}

function createShowHideBtn(start = false) {
  if (!$(".yfomc-sh-btn")[0]) {
    let container = prepareNavContainer();

    if (service == 'netflix') {
      container.prepend('<div class="nav-element yfomc-sh-btn"></div>');
    } else if (service == 'hbogo') {
      container.prepend('<li class="main-menu-item"><a class="yfomc-nav-a yfomc-sh-btn-a" href="#" onClick="return false"><div class="yfomc-sh-btn"></div></a></li>');
    }

    $(".yfomc-sh-btn").on("click", function () { createShowHideBtn(); });
  }

  let btnHtml = '';
  if (start || $("#yfomc-sh-style")[0]) {
    btnHtml = '<div class="yfomc-sh-icon"><svg class="yfomc-i yfomc-i-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M2 20 L12 28 30 4" /></svg></div>';
    btnHtml += '<div class="yfomc-nav-txt yfomc-sh-txt">Obejrzane widoczne</div>';
    $("#yfomc-sh-style").remove();
    $('.yfomc-sh-btn').removeClass("yfomc-sh-hidden");

  } else {
    btnHtml = '<div class="yfomc-sh-icon"><svg class="yfomc-i yfomc-i-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M2 30 L30 2 M30 30 L2 2" /></svg></div>';
    btnHtml += '<div class="yfomc-nav-txt yfomc-sh-txt">Obejrzane ukryte</div>';
    btnHtml += '<style id="yfomc-sh-style">'
      +'.yfomc-viewed,.fl-shelf.shelf-169-xl-highlighted .shelf-169-xl-highlighted-item.yfomc-viewed{display:none!important}'
      +'</style>';
    $('.yfomc-sh-btn').addClass("yfomc-sh-hidden");

  }
  $('.yfomc-sh-btn').html(btnHtml);
}

function createRefreshBtn(wczytywanie = false) {
  if (!$(".yfomc-refresh-container")[0]) {
    let container = prepareNavContainer();

    if (service == 'netflix') {
      container.prepend('<div class="nav-element yfomc-refresh-container"></div>');

    } else if (service == 'hbogo') {
      container.prepend('<li class="main-menu-item"><a class="yfomc-nav-a yfomc-refresh-btn-a" href="#" onClick="return false"><div class="yfomc-refresh-container"></div></a></li>');

    }
  }

  let refreshFilmsList = '';
  if (wczytywanie) {
    refreshFilmsList = '<div>Wczytywanie...<span class="yfomc-refresh-status"></span></div>';
    $('.yfomc-refresh-container').html(refreshFilmsList);

  } else {
    refreshFilmsList = '<div class="yfomc-refresh">'
      + '<div class="yfomc-refresh-icon"><svg class="yfomc-i yfomc-i-reload" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M29 16 C29 22 24 29 16 29 8 29 3 22 3 16 3 10 8 3 16 3 21 3 25 6 27 9 M20 10 L27 9 28 2" /></svg></div>'
      + '<div class="yfomc-nav-txt yfomc-refresh-txt">Odśwież oceny</div>'
      + '</div>';

    $('.yfomc-refresh-container').html(refreshFilmsList);
    $(".yfomc-refresh").on("click", function () {
      // listaFilmowUpdate(filmwebLogin, rodzajeList)
      chrome.runtime.sendMessage({type: "listaFilmowUpdate"});
    });
  }
}

function createRefreshProgress(listsDone, listsAll, pageNr, pagesAll) {
  if (listsDone === listsAll) {
    if (pageNr === pagesAll) {
      console.log('OSTATNI');
      
      chrome.runtime.sendMessage({ type: "filmFilmweb" }, function (response) {
        console.log(response);
        // chrome.storage.local.set(listaFilmow, function () {
          console.log("local SAVED! (interface.js)");
        // });
        createRefreshBtn();
      });

    } else {
      let procent = Math.ceil(100 * pageNr / pagesAll);
      $('.yfomc-refresh-status').html(procent + '%');
    }
  }
}
