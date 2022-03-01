/* ------------------------- */
/* Project  : Taskmaster Pro */
/* File     : script.js      */
/* Author   : Vicente Garcia */
/* Date     : 02/28/2022     */
/* Modified : 02/28/2022     */
/* ------------------------- */
var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr);
    console.log($);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Using JQuery to update textarea task
$(".list-group").on("click", "p", function(){
  // Get current text
  var text = $(this)
  .text()
  .trim();
  // Create new imput emelement
  var textImput = $("<textarea>")
  .addClass("form-control")
  .val(text);
  // Swap out elements
  $(this).replaceWith(textImput);
  // Focus on new element
  textImput.trigger("focus");
  console.log(text);
});

// Function when blur update textarea
$(".list-group").on("blur", "textarea", function(){
  // Get the textarea's current value/text
  var text = $(this)
  .val()
  .trim();
  // Get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");
  // Get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();
  // Replace value in array
  tasks[status][index].text = text;
  saveTasks();
  // Recrate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);
  // Replace textarea with p element
  $(this).replaceWith(taskP);
});

// Update date task
$(".list-group").on("click", "span", function(){
  // Get current date (text)
  var date = $(this)
  .text()
  .trim();
  // Create new input element
  var dateImput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);
  // Swap out elements
  $(this).replaceWith(dateImput);
  // Focus on new element
  dateImput.trigger("focus");
});

// Function when blur update date
$(".list-group").on("blur", "input[type='text']", function(){
  // Get the current date value/text
  var date = $(this)
  .val()
  .trim();
  // Get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");
  // Get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();
  // Replace value in array
  tasks[status][index].date = date;
  saveTasks();
  // Recrate span element
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);
  // Replace input with span element
  $(this).replaceWith(taskSpan);
});

$(".card .list-group").sortable({
  connectWidth: $(".card .list-group")
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();