/// <reference path="jquery-1.3.2-vsdoc.js" />
google.load("jquery", "1");
google.setOnLoadCallback(function() {
	listenKeystrokes();
});
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
    var task = input.parents(".task");
    switch (event.keyCode) {
        case 8: //backspace
            return deletePreviousTask(input);
        case 38: //up
            task.prev().find(".title").focus();
            break;
        case 40: //down
            task.next().find(".title").focus();
            break;
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
    var priority = parseFloat(input.siblings(".priority").val());
    var left = input.val().substring(0, caret);
    var text = input.val().substring(caret);
    var task = input.parents(".task");
    var newTask
    if (left == "") {
        text = "";
        var prevTask = task.prev();
        if (prevTask.length > 0)
            priority = calculatePriority(prevTask, priority);
        else
            priority /= 2;
        task.before($(".newTask").html());
        newTask = task.prev();
    } else {
        input.val(left);
        var nextTask = task.next();
        if (nextTask.length > 0)
            priority = calculatePriority(nextTask, priority);
        else
            priority = -1;
        task.after($(".newTask").html());
        newTask = task.next();
    }
	newTask
	    .find(".title")
	    .val(text)
	    .focus();
	newTask
	    .find(".priority")
	    .val(priority);
	Caret(newTask, 0);
	this.createTaskCallback = function(task) {
	    newTask
	            .find(".key")
	            .val(task.key);
	    newTask
	            .find(".priority")
	            .val(task.priority);
    }
	$.post("insert", { "title": text, "priority": priority }, this.createTaskCallback, "json");
}
function calculatePriority(task, priority) {
    var nextPriority = parseFloat(task.find(".priority").val());
    return (priority + nextPriority) / 2;
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