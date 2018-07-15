var previousLookup = "";

function replaceSelectedText(info, tab) {
  var newText = info.menuItemId;
  chrome.tabs.query({ currentWindow: true, active: true }, function (activeTabs) {
    chrome.tabs.sendMessage(
      activeTabs[0].id, 
      { message: "wordfunk_replace_word", data: newText }, 
      function (response) { });
  });
}

// Add the synonym choices to sub menu
function addChoices(words) {
  var menu = chrome.contextMenus.create(
    { 
      title: "Synonym for '%s'", 
      contexts: ["selection"] 
    });

  if (!words) {
    return;
  }

  words.forEach(function (word) {
    chrome.contextMenus.create(
      {
        title: word.word,
        parentId: menu,
        id: word.word,
        onclick: replaceSelectedText,
        contexts: ["selection"]
      });
  });
}

function requestSynonyms(word) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.datamuse.com/words?rel_syn=" + word, true);
  xhr.onload = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.log(this.responseText);
        var wordList = JSON.parse(this.responseText);
        addChoices(wordList);
      } else {
        console.error(this.statusText);
      }
    }
  }
  xhr.send();  
}

// Catch message from content script
function onMessage(request, sender, sendResponse) {
  if (request.message !== "wordfunk_word_selected" || request.data === previousLookup)
    return;

  // Reset the menu
  chrome.contextMenus.removeAll();

  requestSynonyms(request.data);

  // Save results in case user opens context menu for same word again
  previousLookup = request.data;
}

chrome.runtime.onMessage.addListener(onMessage);