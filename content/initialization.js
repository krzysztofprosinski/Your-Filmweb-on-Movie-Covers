// odsiewaznie danych z filmweb

// let data = {};
// data.filmwebLogin = 'Kelen91';
// data.filmwebLists = ["films", "serials", "wantToSee"];
// chrome.storage.sync.set(data, function () {
//   console.log("sync SAVED!");
// });

var filmwebLogin = 'Kelen91';
// var rodzajeList = ["films", "serials", "wantToSee"]
var rodzajeList = ["films"];
//var rodzajeList = ["serials"];
//var rodzajeList = ["wantToSee"];

var listsAll = rodzajeList.length;
createRefreshBtn();
createShowHideBtn(true);

//var NazwaProfilu = 'Kelen91';
//listaFilmowUpdate(NazwaProfilu);
