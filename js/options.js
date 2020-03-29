// // Saves options to chrome.storage
function save_options() {
  let sync = {}
  sync.login = document.getElementById('login').value;
  sync.serviceNetflix = document.getElementById('serviceNetflix').checked;
  sync.serviceHbogo = document.getElementById('serviceHbogo').checked;
  sync.syncFilms = document.getElementById('syncFilms').checked;
  sync.syncSerials = document.getElementById('syncSerials').checked;
  sync.syncWantToSee = document.getElementById('syncWantToSee').checked;
  console.log(sync);
  chrome.storage.sync.set(sync, function() {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    login: '',
    serviceNetflix: 0,
    serviceHbogo: 0,
    syncFilms: 0,
    syncSerials: 0,
    syncWantToSee: 0
  }, function(sync) {
    document.getElementById('login').value = sync.login;
    if (serviceNetflix) document.getElementById('serviceNetflix').checked = sync.serviceNetflix;
    if (serviceHbogo) document.getElementById('serviceHbogo').checked = sync.serviceHbogo;
    if (syncFilms) document.getElementById('syncFilms').checked = sync.syncFilms;
    if (syncSerials) document.getElementById('syncSerials').checked = sync.syncSerials;
    if (syncWantToSee) document.getElementById('syncWantToSee').checked = sync.syncWantToSee;
  });

}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);