function save_options() {
  var showOnKids = document.getElementById('showOnKids').checked;
  chrome.storage.sync.set({
    showOnKids: showOnKids
  }, function () {
    updateStatus('Options saved.');
  });
}

function restore_options() {
  chrome.storage.sync.get({
    showOnKids: false
  }, function (items) {
    document.getElementById('showOnKids').checked = items.showOnKids;
  });
}

function updateStatus(msg) {
  var status = updateStatus.status || (updateStatus.status = document.getElementById('status'));
  status.textContent = msg;

  clearTimeout(updateStatus.id);
  updateStatus.id = setTimeout(function() {
    status.textContent = '';
  }, 750);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);