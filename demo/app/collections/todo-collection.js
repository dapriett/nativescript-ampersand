var AmpersandCollection = require("nativescript-ampersand/collection");
var TodoModel = require("../models/todo")

module.exports = AmpersandCollection.extend({
  url: "https://jsonplaceholder.typicode.com/todos",
  model: TodoModel
});