// bacgkround page console.log extension storage
chrome.storage.local.get(function (result) {
  console.log('[chrome.storage.local]:')
  console.log(result)
});
chrome.storage.sync.get(function (result) {
  console.log('[chrome.storage.sync]:')
  console.log(result)
});

// chrome.storage.local.get('netflix', function (result) {
//   console.log('[result]:')
//   console.log(result)

//   chrome.storage.local.get('nieistniejacysyf', function (result2) {
//     console.log('[result2]:')
//     console.log(result2)
//     console.log({})
//   });
// });

// chrome.storage.local.clear(function () {
// chrome.storage.sync.clear(function () {
//   let data = {}
//   data = {}
//   data.login = 'Kelen91'
//   data.syncLists = ["films", "serials", "wantToSee"];
//   data.onOff = ["films", "serials", "wantToSee"];
//   chrome.storage.sync.set(data, function () {
// //     console.log("sync SAVED!");
//   });
// });

// chrome.storage.local.remove('test');

// chrome.storage.local.get(function (result) {
//   var data = {
//     'netflix': {},
//     'filmweb': {},
//     'hbogo': {}
//   }
//   // for (let key of Object.keys(result)) {
//   //   let filmwebData = JSON.parse(result[key]);
//   //   let filmwebId = filmwebData.id;
//   //   data.netflix[key] = filmwebId;
//   //   filmwebData.id = { 'n': key };
//   //   data.filmweb[filmwebId] = JSON.stringify(filmwebData);
//   // }

//   data.hbogo[-104055] = "549085";
//   data.filmweb[549085] = '{"id":{"h":"-104055"},"t":"Aquaman","ot":"Aquaman","a":"/Aquaman","type":"f","d":"2018","r":"6,7","ur":5}';

//   chrome.storage.local.clear(function () {
//     chrome.storage.local.set(data, function () {
//       console.log("SAVED!");
//     });
//   });

//   console.log(data);
// });


function getNetflixID(request, id) {
  if (serviceStatus.n.stop) return;

  if (serviceStatus.n.busy) {
    window.setTimeout(function () {
      getNetflixID(request, id)
    }, getRandomInt(50, 300));

  } else {
    serviceStatus.n.busy = true;

    window.setTimeout(function () {
      var urlGet = 'https://www.netflix.com/search?q=' + encodeURIComponent(removeSpecialChars(request.t)) //encodeURIComponent(request.t).replace("'", "%27");
      console.log("[Szukanie ID na Netflixie] " + urlGet);
      $.get(urlGet, function (data) {
        var notFound = true;
        var $element = $(data).find("#row-0 .sliderContent");
        $element.find(".slider-item").each(function () {
          var $div = $(this).find(".slider-refocus a");
          var netflixTitle = $div.attr("aria-label").replace(/\u00a0/g, " ");
          if (netflixTitle !== undefined && removeSpecialChars([request.t, request.ot]).includes(removeSpecialChars(netflixTitle))) {
            var netflixID = $div.attr("href").split("/")[2].split("?")[0];
            //            if (getNetflixIDVerify(netflixID, request)) {
            getNetflixIDVerify(request, id, netflixID);
            //              yfomcSaveData(request, netflixID);
            notFound = false;
            //        console.log($div);

            //            }
          }
        });
        //      if (znaleziono) console.log("Znaleziony: "+ znaleziono);
        if (notFound) {
          console.log("Nie znaleziono: " + request.t);
          serviceStatus.n.busy = false;
        }
      }).fail(function (e) { if (e.status == 403) { serviceStatus.n.stop = true; console.log('%c Netflix STOP', 'color: darkgreen'); } });
    }, getRandomInt(200, 1000));
  }
}

function getHbogoID(request, id) {
  if (serviceStatus.h.stop) return;

  if (serviceStatus.h.busy) {
    window.setTimeout(function () {
      getHbogoID(request, id)
    }, getRandomInt(50, 200));

  } else {
    serviceStatus.h.busy = true;

    window.setTimeout(function () {
      let urlGet = 'https://plapi.hbogo.eu/v8/Search/json/POL/COMP/' + encodeURIComponent(removeSpecialChars(request.t)) + '/-/-/-/-/-/3';
      console.log("[Szukanie ID na HBO GO] " + urlGet);
      $.get(urlGet, function (data) { // dataJSON
        let notFound = true;
        // console.log('dataJSON:');
        // console.log(dataJSON);
        // let data = JSON.parse(dataJSON);

        if (data.Container[0].Contents.Items[0] !== undefined) {
          $.each(data.Container[0].Contents.Items, function (index, val) {
            let hbogoTitles = removeSpecialChars([val.Name, val.EditedName, val.SeriesName, val.OriginalName, val.Tracking.ShowName])
            if ((hbogoTitles.includes(removeSpecialChars(request.t)) || hbogoTitles.includes(removeSpecialChars(request.ot)))
              && ((request.type == "f" && val.AdditionalName != "Serial") || (request.type == "s" && val.AdditionalName == "Serial"))
            ) {
              yfomcSaveData(request, id, val.ExternalId, 'hbogo');
              console.log('%c Znaleziony: [' + id + '] ' + request.t, 'color: darkgreen');
            }
            else console.log("Nie znaleziono: " + request.t);
          });
        }
        serviceStatus.h.busy = false;
      });
    }, getRandomInt(50, 700));
  }
}

function getNetflixIDVerify(request, id, netflixID) {
  if (serviceStatus.n.stop) return;

  var urlGet = 'https://www.netflix.com/title/' + netflixID;
  console.log("[Szukanie ID netflix - Szczegóły] " + urlGet);
  //    console.log(request);
  $.get(urlGet, function (data) {
    //      console.log(data);
    var $element = $(data).find(".video-meta");
    var dataYear = $element.find('.year').html();
    var dataDuration = $element.find('.duration').html();//.includes(substring);
    //      console.log(dataYear+ ' === ' + request.d);
    //      console.log(dataYear === request.d);
    //      console.log('('+ request.type +' === "f" && ('+ dataDuration.includes("godz") + ' || '+ dataDuration.includes("min") +')) || ('+ request.type +' === "s")');
    //      console.log((request.type === "f" && (dataDuration.includes("godz") || dataDuration.includes("min"))) || (request.type === "s"));
    if (request.type === "f" && (dataYear >= request.d - 1 && dataYear <= request.d + 1) && (dataDuration.includes("godz") || dataDuration.includes("min"))) {
      // film
      // yfomcSaveData(request, netflixID);
      yfomcSaveData(request, id, netflixID, 'netflix');
      console.log('%c Znaleziony: ' + request.t, 'color: darkgreen');
    } else if (request.type === "s" && !dataDuration.includes("godz") && !dataDuration.includes("min")) {
      // serial
      // yfomcSaveData(request, netflixID);
      yfomcSaveData(request, id, netflixID, 'netflix');
      console.log('%c Znaleziony: ' + request.t, 'color: darkgreen');
    } else console.log("Nie znaleziono: " + request.t);
    serviceStatus.n.busy = false;

  }).fail(function (e) { if (e.status == 403) { serviceStatus.n.stop = true; console.log('%c Netflix STOP', 'color: darkgreen'); } });
}



//function yfomcUpdate_map(id, source, sourceURL){
// var yfomcSaveData_w8 = false;
function yfomcSaveData(dataArray, id, sourceId, sourceName = 'netflix') {
  // var idLocal = source + id;
  // var idLocal = id;
  // chrome.storage.local.get(idLocal, function (data) {

  // if (!yfomcSaveData_w8) {
  // yfomcSaveData_w8 = true;
  // chrome.storage.local.get(sourceName, function (source) {
  // let filmweb = (data.hasOwnProperty(data.filmweb)) ? JSON.parse(data.filmweb) : {};
  // console.log('[' + sourceId + '] source:')
  // console.log(source)

  // source[sourceName][sourceId] = id;
  let toSave = {};
  let prefix = getPrefix(sourceName)
  toSave[prefix + sourceId] = id

  // console.log('source AFTER:')
  // console.log(source)

  // var itemJSON = JSON.stringify(dataArray);


  // if (data[idLocal]) {
  //   // jesli juz jest taki rekord
  //   //      var storageJSON = JSON.parse(data[idLocal]);
  //   //      if(storageJSON.score) {
  //   //        itemJSON = JSON.stringify({'URL' : sourceURL, 'score': storageJSON.score, 'v': '1' });
  //   //      }
  // }
  // let local = {};
  // local[sourceName] = source;
  // console.log('local:');
  // console.log(local);
  console.log("%c [SAVED!] yfomcSaveData(-, " + id + ", " + sourceId + ", " + sourceName + ")", 'color: #216583');
  chrome.storage.local.set(toSave);
  // chrome.storage.local.set(source, function () {
  // yfomcSaveData_w8 = false;
  // });
  // });
  // } else {
  //   setTimeout(function () {
  //     yfomcSaveData(dataArray, id, sourceId, sourceName)
  //   }, 200)
  // }
}
