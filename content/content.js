var service = (window.location.hostname.includes("netflix")) ? 'netflix' : 'hbogo';

function yfomcGetInfo(data) {
  if (data !== undefined) {
    //        console.log(data);
    var infoJSON = JSON.parse(data);
    //        if(infoJSON.ur == "0" || infoJSON.ur == "" || infoJSON.ur == undefined) infoJSON.ur="?";
    if (infoJSON.ur == "0" || infoJSON.ur == undefined) infoJSON.ur = '';
    if (infoJSON.f == "0" || infoJSON.f == undefined) infoJSON.f = '';
    if (infoJSON.w == "0" || infoJSON.w == undefined) infoJSON.w = '';
    return infoJSON;

  } else return false;
}

function yfomcPlaceScore(titleName, idService, filmBox) {
  //      chrome.runtime.sendMessage({type: "getScore", idService: idService});

  //    if(filmBox.find('div.yfomc_score').length == 0 || filmBox.find('div.yfomc_score').text != '?'){

  if (filmBox.find('div.yfomc-container').length == 0) {
    /* Read and place score from storage */
    let prefix = getPrefix(service)
    console.log('%c .yfomc-container | ' + prefix + idService, 'color: green');
    chrome.storage.local.get(prefix + idService, function (data) {
      // if (idService == '-104055') {
      // console.log('%c sszzzzzzzzzzzzzs ', 'color: green');  
      // console.log(idService);
      // console.log(data);
      // console.log(data[service][idService]);
      // }
      let prefix = getPrefix(service)
      if (data[prefix + idService]) {
        console.log('data[prefix + idService]')
        console.log(data[prefix + idService])

        let idFilmweb = data[prefix + idService];
        console.log('%c bbbbbbbbbbbbbbbb ', 'color: green');
        if (idFilmweb) {

          console.log('%c asdasaaaaaaaaaaaaaaaaa ', 'color: green');

          let idFilmwebWithPrefix = getPrefix('filmweb') + idFilmweb
          chrome.storage.local.get(idFilmwebWithPrefix, function (dataF) {
            if (JSON.stringify(dataF[idFilmwebWithPrefix]) != '{}') {
              console.log('%c --- idFilmweb | ' + idFilmwebWithPrefix, 'color: orange');
              console.log(dataF[idFilmwebWithPrefix]);
              var yfomcInfo = yfomcGetInfo(dataF[idFilmwebWithPrefix]);
              console.log(yfomcInfo);
              var yfomcWantToSee = yfomcInfo.w.toLocaleString();
              var yfomcScore = yfomcInfo.ur.toLocaleString();
              var yfomcFavorite = yfomcInfo.f.toLocaleString();

              if (yfomcWantToSee != '') {
                filmBox.find(".yfomc-container").append('<div class="yfomc-want-to-see">'
                  + '<svg class="yfomc-i yfomc-i-eye" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M2 16 C2 16 7 6 16 6 25 6 30 16 30 16 30 16 25 26 16 26 7 26 2 16 2 16 Z"></path><circle cx="16" cy="16" r="6"></circle><circle cx="16" cy="16" r="1"></circle></svg>'
                  + '</div>');
              } else if (yfomcScore != '') {
                filmBox.addClass('yfomc-viewed');
              }

              if (yfomcScore != '' || yfomcFavorite != '') {
                filmBox.find(".yfomc-container").append("<div class='yfomc-user-rate-container'>" + '<svg class="yfomc-i yfomc-i-bookmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M6 2 L26 2 26 30 16 20 6 30 Z" /></svg>' + "</div>");
              }
              if (yfomcScore != '') {
                filmBox.find(".yfomc-user-rate-container").prepend('<svg class="yfomc-i yfomc-i-bookmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M6 2 L26 2 26 30 16 20 6 30 Z" /></svg>' + "<div class='yfomc-user-rate'>" + yfomcScore + "</div>");
              }
              if (yfomcFavorite != '') {
                filmBox.find(".yfomc-user-rate-container").append('<div class="yfomc-favorite"><svg class="yfomc-i yfomc-i-heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 16 C1 12 2 6 7 4 12 2 15 6 16 8 17 6 21 2 26 4 31 6 31 12 28 16 25 20 16 28 16 28 16 28 7 20 4 16 Z" /></svg></div>');
              }

            }
          });
        }

      }

    });
    filmBox.append("<div class='yfomc-container yfomc-id-" + idService + "'></div>");
  }
}

/* 
 * Listens to changes in data storege and changes information about ratings
 */
chrome.storage.onChanged.addListener(function (changes, namespace) {
  let data, yfomcScore;
  for (key in changes) {
    data = (changes[key].newValue !== undefined) ? changes[key].newValue : changes[key].oldValue;
    let info = yfomcGetInfo(data);
    if (!$.isEmptyObject(info) && !$.isEmptyObject(info.ur)) {
      yfomcScore = info.ur.toLocaleString();
      $(".yfomc-id-" + key).html("<div class='yfomc-user-rate-container'><div class='yfomc-user-rate'>" + yfomcScore + "</div></div>");
      $(".yfomc-id-" + key).closest('.slider-item').addClass('yfomc-viewed');
    }
  }
});


// Default ratings source website
//var yfomcScoreSource = 'filmweb';
// var yfomcReadStore = "yfomcScoreSource";
// chrome.storage.local.get(yfomcReadStore, function (data) {
//    if((data !== undefined) && (data[yfomcReadStore] !== undefined)) yfomcScoreSource = data[yfomcReadStore];

// For all displayed titles
if (service == 'netflix') {
  $('.slider-item').each(function () {
    titleName = $(this).find('.fallback-text:first').text();  // Gets the title's name
    var href = $(this).find('a').attr('href');
    idNetflix = (href !== undefined) ? href.replace(/\/watch\/([0-9]*).*/, "$1") : false; // Gets the title's netflix ID
    if (idNetflix) {
      yfomcPlaceScore(titleName, idNetflix, $(this));
    }
  });
} else if (service == 'hbogo') {
  $('.shelf-item, .grid-item').each(function () {
    titleName = $(this).find('.title').text();  // Gets the title's name
    idService = $(this).attr('data-external-id'); // Gets the title's netflix ID
    // console.log(idService);
    if (idService) {
      yfomcPlaceScore(titleName, idService, $(this));
    }
  });
}


// Allows to monitor changes in DOM.
var yfomcObserver = new MutationObserver(function (mutations) {   // based on https://gabrieleromanato.name/jquery-detecting-new-elements-with-the-mutationobserver-object/
  mutations.forEach(function (mutation) {
    var newNodes = mutation.addedNodes; // DOM NodeList
    if (newNodes !== null) { // If there are new nodes added
      var $nodes = $(newNodes); // jQuery set
      $nodes.each(function () {
        if ($(this).attr('class') !== undefined) {
          // For all displayed titles
          if (service == 'netflix') {
            $(this).find('.title-card').closest('.slider-item').each(function () {
              // $('.slider-item').each(function () {
              titleName = $(this).find('.fallback-text:first').text();  // Gets the title's name
              var href = $(this).find('a').attr('href');
              idNetflix = (href !== undefined) ? href.replace(/\/watch\/([0-9]*).*/, "$1") : false; // Gets the title's netflix ID
              if (idNetflix) {
                yfomcPlaceScore(titleName, idNetflix, $(this));
              }
            });
          } else if (service == 'hbogo') {
            // console.log('-------------- $this');
            // console.log(this);
            $(this).closest('.shelf-item, .grid-item').each(function () {
              // console.log('-------------- .shelf-item');
              // console.log(this);
              // console.log($(this).attr('data-external-id'));
              // $('.shelf-item').each(function () {
              titleName = $(this).find('.title').text();  // Gets the title's name
              idService = $(this).attr('data-external-id'); // Gets the title's netflix ID
              // console.log(idService);
              if (idService) {
                // console.log(idService);
                yfomcPlaceScore(titleName, idService, $(this));
              }
            });
          }
        }
      });
    }
  });
});

// Configuration of the MutationObserver:
var yfomcConfig = {
  childList: true,
  subtree: true,
  characterData: true
};

// Pass in the target node, as well as the observer options
let containerForObserve;
if (service == 'netflix') containerForObserve = $('#appMountPoint')[0];
else if (service == 'hbogo') containerForObserve = $('.maincontent')[0];

if (containerForObserve) yfomcObserver.observe(containerForObserve, yfomcConfig);
