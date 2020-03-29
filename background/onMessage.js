/* Listens and handles messages sent from content/front */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "filmFilmweb") {
    console.log('type: ' + request.type);
    var time = 0;

    console.log('request.data:');
    console.log(request.data);
    // $.each(request.data, function (index, value) {
    //   setTimeout(function () {
    //     // console.log('id: ' + request.id);
    //     // console.log('value: ' + value);
    //     // if (typeof value.id.n === 'undefined' || value.id.n == '') getNetflixID(value);
    //     // if (typeof value.id.h === 'undefined' || value.id.h == '') getHbogoID(value, request.id);
    //   }, time)
    //   time += 200;
    // });
    sendResponse("background.js: Got info");
  }
});
