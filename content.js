function replaceSelectedText(request, sender, sendResponse) {
    if (request.message == "wordfunk_replace_word")
      document.execCommand("insertText", false, request.data); 
}

document.addEventListener("mouseup",function(event)
{						  	
    var selectedText = window.getSelection().toString();

    if(selectedText.length)
        chrome.runtime.sendMessage({message:"wordfunk_word_selected", data: selectedText},function(response){})
}); 

chrome.runtime.onMessage.addListener(replaceSelectedText);