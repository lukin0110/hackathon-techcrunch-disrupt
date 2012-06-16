var MS = MS || {};

/**
 * Create the context menu with 2 sub items
 */
var _parent = chrome.contextMenus.create({"title":"Music discovery","contexts" : ["page", "image", "selection"]});


/**
 * Context menu item for discovery.  It fetches all the artists in the fotos an shows up their info
 * contexts ( optional array of string ["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"] )
 */
chrome.contextMenus.create({
	"title" : "Discover",
    "parentId": _parent,
    "type" : "normal",
    "contexts" : ["page", "image", "selection"],
    "onclick": function(info, tab){MS._menuDiscover(info, tab);}
});


/**
 * The context menu item for tag the artists in these fotos
 */
chrome.contextMenus.create({
	"title" : "Tag",
    "parentId": _parent,
    "type" : "normal",
    "contexts" : ["page", "image"],
    "onclick": function(info, tab){MS._menuTagging(info, tab);}
});


/**
 *
 */
chrome.contextMenus.create({
	"title" : "Train",
    "parentId": _parent,
    "type" : "normal",
    "contexts" : ["page"],
    "onclick": function(info, tab){MS._menuTrain(info, tab);}
});


/**
 * Receives request from anywhere, popup, content scripts, etc ....
 * Mainly used for logging from anywhere
 *
 * http://samdutton.wordpress.com/2010/12/16/debugging-google-chrome-extensions/
 */
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse)
    {
        if(request.log)
        {
            console.log(request.log);
        }
    }

    /*
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
    else
      sendResponse({}); // snub them.
  }
     */
);


/**
 * Menu onClick handler
 *
 * @param info
 * @param tab
 * @private
 */
MS._menuDiscover = function(info, tab)
{
    //console.log("item " + info.menuItemId + " was clicked");
	console.log("info: " + JSON.stringify(info));
	console.log("tab: " + JSON.stringify(tab));

    //chrome.tabs.insertCSS(integer tabId, object details, function callback)
    //MS._loadCss("css/style.css");
    //MS._loadScript("js/jquery-1.6.3.min.js");
    //MS._loadScript("js/library.js");
    //MS._loadScript("js/discovery.js");
    chrome.tabs.insertCSS(null, {file:"css/style.css"});
    chrome.tabs.executeScript(null, {file:"js/jquery-1.6.3.min.js"});
    chrome.tabs.executeScript(null, {file:"js/library.js"});
    chrome.tabs.executeScript(null, {file:"js/discovery.js"});

    if(info["mediaType"]==="image")
    {
        console.log("Background 1,1 = " );
        chrome.tabs.getSelected(null, function(tab) {
            console.log("Background 1.2 = " );
            chrome.tabs.sendRequest(tab.id, {type: "image", url:info["srcUrl"]});
        });
    }
    else
    {
        console.log("Background 2.1 = " );
        chrome.tabs.getSelected(null, function(tab) {
            console.log("Background 2.2 = " );
            chrome.tabs.sendRequest(tab.id, {type: "all"});
        });
    }
};


/**
 * Bla bla here
 *
 * @param info
 * @param tab
 * @private
 */
MS._menuTagging = function(info, tab)
{
    //MS._loadCss("css/style.css");
    //MS._loadScript("js/jquery-1.6.3.min.js");
    //MS._loadScript("js/library.js");
    //MS._loadScript("js/tag.js");

    chrome.tabs.insertCSS(null, {file:"css/style.css"});
    chrome.tabs.executeScript(null, {file:"js/jquery-1.6.3.min.js"});
    chrome.tabs.executeScript(null, {file:"js/library.js"});
    chrome.tabs.executeScript(null, {file:"js/tag.js"});

    if(info["mediaType"] === "image")
    {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendRequest(tab.id, {type: "image", url:info["srcUrl"]});
        });
    }
    else
    {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendRequest(tab.id, {type: "all"});
        });
    }
};


/**
 *
 * @param info
 * @param tab
 */
MS._menuTrain = function(info, tab)
{
    MS._loadScript("js/jquery-1.6.3.min.js");
    MS._loadScript("js/library.js");
    MS._loadScript("js/training.js");
};



MS._scriptsLoaded = {};
MS._cssLoaded = {};

MS._loadScript = function(path)
{
    if(!MS._scriptsLoaded[path])
    {
        chrome.tabs.executeScript(null, {file:path});
        MS._scriptsLoaded[path] = true;
    }
};


MS._loadCss = function(path)
{
    if(!MS._cssLoaded[path])
    {
        chrome.tabs.insertCSS(null, {file:path});
        MS._cssLoaded[path] = true;

    }
};



