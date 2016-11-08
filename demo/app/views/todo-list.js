var TodoModel = require( "../models/todo" );
var TodoCollection = require( "../collections/todo-collection" );
var observable = require("data/observable");

var todos = new TodoCollection();

var listView = null;


exports.load = function(args){
  var page = args.object;
  page.bindingContext = new observable.Observable({todos: todos, newTodo: ''});

  listView = page.getViewById("listView");

  todos.fetch(function() {
    console.log(todos.toJSON());
  });
}

exports.addTodo = function(args){
  var textField = args.object;
  if(!textField.text || !textField.text.length) return;
  var todo = new TodoModel({title: textField.text, completed: false});
  todos.add(todo, {at: 0});
  todo.save();
  textField.text = "";
  listView.scrollToIndex(0);

}

exports.removeTodo = function(args){
  var todo = args.object.bindingContext;
  todo.destroy();
}

exports.markTodo = function(args){
  var todo = args.object.bindingContext;
  todo.completed = !todo.completed;
  todo.save();
}

exports.refresh = function(args) {
  todos.fetch({
    success: function() {
      var listView = args.object;
      listView.notifyPullToRefreshFinished();
    }
  });
}