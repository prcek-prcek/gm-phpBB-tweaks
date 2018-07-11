// ==UserScript==
// @name		phpBB tweaks
// @namespace	prcek
// @description More usability for phpBB
// @include		*/search.php?search_id=unreadposts*
// @version		3
// @grant		none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==
this.$ = this.jQuery = jQuery.noConflict(true);

// logging settings
var logPrefix = 'phpBB-gm: ';
var logLevel = 2;

// logging function
function log( message, msgLevel) {
	if (msgLevel <= logLevel) {
		console.log(logPrefix + message);
	}
}

// find correct dl element for topic
function findDlElement( liElement)
{
    var dlElement = $(liElement).find("dl.icon")[0];
    if (! dlElement) {
        dlElement = $(liElement).find("dl.row-item")[0];
    }
    return dlElement;
}

// Add bigger <a> to first unread post on topic; takes <li> element to modify
function addUnreadIcon( liElement )
{
	log('addUnreadIcon called', 9);
	// obtain data
	var dlElement = findDlElement(liElement);
	// newer versions have this link already set, no need to add it again
	var tmpElement = $(dlElement).find("a.icon-link")[0];
	if (! tmpElement) {
		tmpElement = $(dlElement).find("a.row-item-link")[0];
	}
    if (tmpElement) {
		log("Unread icon already exists", 9);
		return 0;
	}

	var image = $(dlElement).css("background-image").replace( /url\(|\)/g, '');
	var firstElement = dlElement.children[0];
	tmpElement = $(firstElement).find("a")[0];
	var unreadLink = tmpElement['href'];
	tmpElement = $(tmpElement).find("img")[0];
	if (tmpElement) {
		imgTitle = tmpElement['title'];
		imgAlt = tmpElement['alt'];
	} else {
	  imgTitle = "Unread posts";
	  imgAlt = "Unread posts";
	  log('img element was not found', 9);
	}
	// make changes
	$(dlElement).css("background-image", "none");
	$(firstElement).css("padding-left", 5);
	var newElement = document.createElement('dd');
	var html = '<a href=' + unreadLink + ' style="padding-left: 5px;"><img src=' + image + ' alt="' + imgAlt + '" title="' +imgTitle + '"></img></a>';
	newElement.innerHTML = html;
	dlElement.insertBefore(newElement, firstElement);
}

// Add <a> to mark topic as readed; tales <li> element to modify
function addMarkAsReadIcon( liElement )
{
	log('addMarkAsReadIcon called', 9);
	// obtain data
	var dlElement = findDlElement(liElement);
	var lastElement = $(dlElement).find("dd.lastpost")[0];
	var tmpElement = $(lastElement).find("a")[1];
	var lastLink = tmpElement['href'];
	tmpElement = $(liElement).find("dd.posts")[0];
	var ddLineHeight = $(tmpElement).css("line-height");
	var ddFontSize = $(tmpElement).css("font-size");
	// make changes
	var newElement = document.createElement('dd');
	var html = '<a href="#" lastpost=' + lastLink + 'style="padding: 0px; margin: 0px;"><img style="padding: 0px; margin: 0px;" src=' + markAsReadIcon + ' alt="Mark topic as read" title="Mark topic as readed" lastpost=' + lastLink + '></img></a>';
	newElement.innerHTML = html;
	$(newElement).css("line-height", ddLineHeight);
	$(newElement).css("font-size", ddFontSize);
	$(newElement).click(function(event) { readTopic(event); });
	var width = $(lastElement).css("width");
	log("orig width:" + $(lastElement).css("width"), 9);
	width = width.replace("px","");
	width = Number(width) - 17; // 16 is width of icon + border
	width = String(width) + "px"
	$(lastElement).css("width", width);
	log("New width: " + $(lastElement).css("width"), 9);
	dlElement.appendChild(newElement);
}

// Find all topic <li> elements (lines)
function getTopics()
{
	result = $("li[class^='row ']");
	return(result);
}

// "Read" topics = hide row and load last post in the background; takes <a> element
function readTopic(event)
{
	log("readTopic called", 9);
	// do nothing at the moment
	var lastPost = event.target.getAttribute('lastpost');
	var liElement = $(event.target).parents("li")[0];
	// ToDo real work here
	function onSuccess() {
		readTopicCallback(liElement);
	}
	function onFailure() {
		// do nothing
	}
	$.ajax( lastPost, {
		type: "GET",
		url: lastPost,
		success: onSuccess,
		error: onFailure
		}
	);
	log('ajax started', 9);
	$(liElement).css("overflow","hidden");
	$(liElement).css("height","2px");
	// do not handle this event by default handler
	event.preventDefault();
}

// is called after successfull loading page with last post
function readTopicCallback( liElement) {
	log("readTopicCallback called", 9);
	$(liElement).css("display", "none");
}

// main

log("tweaks for phpBB forum loaded", 0);

var markAsReadIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QoLCA4e5uK8cgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAwElEQVQ4y5WTsRHCMAwA35rBDXt4AOiBCSgo2QJnC6AKOzBA6D2KdgiNuQuOIwc1vpP8b/sku+Q9wAhsg+qbFZG8vwIRcJJhgCEX1sIAowCHST1akgIGGCSovopkVVKDg+rOGRtiUO0sGMA1TonF+gPPBAsSluCqwJDMYABhffS1pPzxhL7WHWnAd+BstVgsOKhegurTmhOX4RtwBDZTuNXioNq55P0eeFiwJXHJ+7G89h+fCZnMwqkFA+Tx/grcB65WaEE7gc59AAAAAElFTkSuQmCC"
//try {
//	  markAsReadIcon = $("li.icon-logout").css("background-image").replace( /url\(|\)/g, '').replace( /logout/g, 'register');
//} catch (err) {
//	  log('Cannot find mark as read icon ' + err.message, 8)
//}

// modify all displayed topics
var topics = getTopics();
var idx = 0;
// possibility to use  array.forEach(function) ?? ToDo
while (idx < topics.length) {
	addUnreadIcon(topics[idx]);
	addMarkAsReadIcon(topics[idx]);
	idx++;
}
