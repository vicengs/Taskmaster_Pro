/* ------------------------- */
/* Project  : Taskmaster Pro */
/* File     : script.js      */
/* Author   : Vicente Garcia */
/* Date     : 02/28/2022     */
/* Modified : 03/03/2022     */
/* ------------------------- */
var tasks = {};

var auditTask = function(taskEl){
  // Get date from task element
  var date = $(taskEl).find("span").text().trim();
  // Convert to mement object at 5:00pm
  var time = moment(date, "L").set("hour",17);
  // Remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // Apply new class if task is near/over due date
  if (moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger");
  }else if (Math.abs(moment().diff(time, "days")) <= 2){
    $(taskEl).addClass("list-group-item-warning");
  }
};

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
  // Check due date
  auditTask(taskLi);
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
  // Enable JQuery UI datepicker
  dateImput.datepicker({
    minDate: 1,
    onClose: function(){
      //When calendar is closed, force a "change" event on the 'dateImput'
      $(this).trigger("change");
    }
  });
  // Focus on new element
  dateImput.trigger("focus");
});

// Function when blur update date
$(".list-group").on("change", "input[type='text']", function(){
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
  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
  },
  update: function(event) {
    // Array to store the task data in
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
      .find("p")
      .text()
      .trim();
      var date = $(this)
      .find("span")
      .text()
      .trim();
      // Add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    // Trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");
    // Update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui){
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function(event, ui){
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui){
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

$("#modalDueDate").datepicker({
  minDate: 1
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
$("#task-form-modal .btn-save").click(function() {
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
// Refresh each interval of 30 mins
setInterval(function(){
  $(".card .list-group-item").each(function(index, el){
    auditTask(el);
  });
}, 1800000);