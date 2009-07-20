/// <reference path="jquery-1.3.2-vsdoc.js" />
google.load("jquery", "1");
google.setOnLoadCallback(function() {
	fillPriority();
	listenKeystrokes();
});

function fillPriority(){
	var counter = 0;
	$(".priority").each(function() {
		$(this).val(counter);
		counter ++;
	});
}

function listenKeystrokes(){
    $(".title").live("keyup", onKeyUp);
    $(".title").live("keydown", onKeyDown);
}
function onKeyUp(event) {
    var input = $(event.target);
    switch (event.keyCode) {
        case 13: //enter
            createTask(input);
            break;
    }
    saveModifications(input);
}
function onKeyDown(event){
    var input = $(event.target);
    switch (event.keyCode) {
        case 8: //backspace
            return deletePreviousTask(input);
        case 46: //delete
            return deleteNextTask(input);
    }
}
function saveModifications(input) {
    var key = input.siblings(".key").val();
    var title = input.val();
    $.post("update", { "key" : key, "title": title });
}
function createTask(input){
    var caret = Caret(input);
    var priority = parseInt(input.siblings(".priority").val());
    var left = input.val().substring(0, caret);
    var text = input.val().substring(caret);
    if (left == "")
        text = "";
    else {
        input.val(left);
        priority += 1;
    }
	var item = $(".task").eq(priority);
	item.before($(".newTask").html());
	var newItem = $(".task").eq(priority);
	newItem
	    .find(".title")
	    .val(text)
	    .focus();
	newItem
	    .find(".priority")
	    .val(priority);
	Caret(newItem, 0);
	fillPriority();
	this.createTaskCallback = function(id) {
	    newItem
	        .find(".key")
	        .val(id);
	}
	$.post("insert", { "title": text, "priority": priority }, this.createTaskCallback);
}
function deletePreviousTask(input) {
    var caret = Caret(input);
    if (caret === 0) {
        var text = input.val();
        var previousInput = input.parents(".task").prev().find(".title");
        deleteTask(input);
        appendText(previousInput, text);
        return false;
    }
    return true;
}
function deleteNextTask(input) {
    var caret = Caret(input);
    if (caret === input.val().length) {
        var nextInput = input.parents(".task").next().find(".title");
        var nextText = nextInput.val();
        deleteTask(nextInput);
        appendText(input, nextText);
        return false;
    }
    return true;
}
function deleteTask(input) {
    var key = input.siblings(".key").val();
    $.post("delete", { "key": key });
    var row = input.parents(".task");
    row.remove();
}
function appendText(input, text) {
    var originalLength = input.val().length;
    input.val(input.val() + text)
            .focus();
    Caret(input, originalLength);
}