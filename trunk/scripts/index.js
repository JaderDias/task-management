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
	$("input[type='text']").live("keyup", function(event){
		var input = $(event.target);
		var caret = Caret(input);
		var priority = parseInt(input.prev(".priority").val());
		switch (event.keyCode) {
			 case 13:
			 	var left = input.val().substring(0, caret);
				var right = input.val().substring(caret);
				if(left == "")
				 	createTask(left, priority);
				else{
					input.val(left);
					createTask(right, priority + 1);
				}
				break;
		}
	});
}

function createTask(text, priority){
	var items = $(".task");
	var item = items.eq(priority);
	item.before($(".newTask").html());
	item = $(".task")
	    .eq(priority)
	    .find("input[type='text']")
	    .val(text)
	    .focus();
	Caret(item, 0);
	fillPriority();
}
