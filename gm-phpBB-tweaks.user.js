// ==UserScript==
// @name        phpBB tweaks
// @namespace   prcek
// @description More usability for phpBB
// @include     */search.php?search_id=unreadposts*
// @version     1
// @grant       none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==
this.$ = this.jQuery = jQuery.noConflict(true);


// Add bigger <a> to first unread post on topic; takes <li> element to modify
function addUnreadIcon( liElement )
{
	// obtain data
	var dlElement = $(liElement).find("dl.icon")[0];
	var image = $(dlElement).css("background-image").replace( /url\(|\)/g, '');
	var firstElement = dlElement.children[0];
	var tmpElement = $(firstElement).find("a")[0];
	var unreadLink = tmpElement['href'];
	tmpElement = $(tmpElement).find("img")[0];
	var imgTitle = tmpElement['title'];
	var imgAlt = tmpElement['alt'];
	// make changes
	$(dlElement).css("background-image","");
	$(firstElement).css("padding-left",5);
	var newElement = document.createElement('dd');
	var html = '<a href=' + unreadLink + ' style="padding-left: 5px;"><img src=' + image + ' alt="' + imgAlt + '" title="' +imgTitle + '"></img></a>';
	newElement.innerHTML = html;
	dlElement.insertBefore(newElement, firstElement);
}

// Add <a> to mark topic as readed; tales <li> element to modify
function addMarkAsReadIcon( liElement )
{
	// obtain data
	var dlElement = $(liElement).find("dl.icon")[0];
	var tmpElement = $(dlElement).find("dd.lastpost")[0];
	tmpElement = $(tmpElement).find("a")[1];
	var lastLink = tmpElement['href'];
	tmpElement = $(liElement).find("dd.posts")[0];
	var ddLineHeight = $(tmpElement).css("line-height");
	var ddFontSize = $(tmpElement).css("font-size");
	// make changes
	var newElement = document.createElement('dd');
	var html = '<a href="#" lastpost=' + lastLink + 'style="padding: 5px; margin: 0px;"><img style="padding: 0px; margin: 0px;" src=' + markAsReadIcon + ' alt="Mark topic as read" title="Mark topic as read" lastpost=' + lastLink + '></img></a>';
	newElement.innerHTML = html;
	$(newElement).css("line-height", ddLineHeight);
	$(newElement).css("font-size", ddFontSize);
	$(newElement).click(function(event) { readTopic(event); });
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
	// console.log("onClick");
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
	//console.log('ajax started');
	$(liElement).css("height","2px");
	// do not handle this event by default handler
	event.preventDefault();
}

// is called after successfull loading page with last post
function readTopicCallback( liElement) {
	// console.log("callback fired");
	$(liElement).css("display", "none");
}

// main

console.log("phpBB-gm - tweaks for phpBB forum loaded");

// icons
var markAsReadIcon = $("li.icon-logout").css("background-image").replace( /url\(|\)/g, '').replace( /logout/g, 'register');

// modify all displayed topics
var topics = getTopics();
var idx = 0;
// possibility to use  array.forEach(function) ?? ToDo
while (idx < topics.length) {
	addUnreadIcon(topics[idx]);
	addMarkAsReadIcon(topics[idx]);
	idx++;
}

