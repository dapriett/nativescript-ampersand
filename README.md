# nativescript-ampersand
A NativeScript module to add [Ampersand.js](http://ampersandjs.com/) [Models](http://ampersandjs.com/docs#ampersand-model) and [Rest Collections](http://ampersandjs.com/docs#ampersand-rest-collection) for use in place of nativescript observables.  Ampersand.js is a fork of [Backbone.js](http://backbonejs.org/), providing alot of the same functionality with additional features.  All server sync methods are available and uses the built in Nativescript http module out of the box.  For more information on Ampersand.js see their [documentation](http://ampersandjs.com/docs).

[![NPM version][npm-image]][npm-url] [![Dependency status][david-dm-image]][david-dm-url]
[npm-url]: https://npmjs.org/package/nativescript-ampersand
[npm-image]: http://img.shields.io/npm/v/nativescript-ampersand.svg
[david-dm-url]:https://david-dm.org/dapriett/nativescript-ampersand
[david-dm-image]:https://david-dm.org/dapriett/nativescript-ampersand.svg

[![NPM](https://nodei.co/npm/nativescript-ampersand.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.org/package/nativescript-ampersand)

## Installation

Run `npm install nativescript-ampersand --save` from your nativescript project

## Usage

##### Models

Just use `require("nativescript-ampersand/model")` to include the AmpersandModel, and then extend it for your model.  See the [Ampersand Model documentation](http://ampersandjs.com/docs#ampersand-model) for available methods and configuration options.

```
// ./app/models/todo.js

var AmpersandModel = require("nativescript-ampersand/model");

module.exports = AmpersandModel.extend({

  urlRoot: "http://www.example.com/todos",

	// Properties this model will store
	props: {
		title: {
			type: 'string',
			default: ''
		},
		completed: {
			type: 'boolean',
			default: false
		}
	},
	// session properties work the same way as `props`
	// but will not be included when serializing.
	session: {
		editing: {
			type: 'boolean',
			default: false
		}
	},
	destroy: function () {
		if (this.collection) {
			this.collection.remove(this);
		}
	}
});
```

Then just use them in your views.  You can set them to the view's bindingContext and they'll automatically update with any model changes.

```
// ./app/views/todo-view.js
var TodoModel = require( "../models/todo" );

var todo = new Todo({
  title: "Enter new TODO"
});

exports.load = function(args){
  args.object.bindingContext = todo;
}

exports.save = function() {
   todo.save();
}

```

##### Rest Collections

Just use `require("nativescript-ampersand/collection")` to include the AmpersandRestCollection, and then extend it for your collection.

```
// ./app/collections/todo-collection.js

var AmpersandCollection = require("nativescript-ampersand/collection");
var TodoModel = require("../models/todo")

module.exports = AmpersandCollection.extend({
  url: "http://www.example.com/todos",
  model: TodoModel
});
```

Then just use them in your views.  You can bind them to a listview and they'll automatically update with collection changes.

```
// ./app/views/todos.js
var TodoCollection = require( "../collections/todo-collection" );

var todos = new TodoCollection();

exports.load = function(args){
  args.object.bindingContext = {todos: todos};
  todos.fetch();
}

exports.refresh = function() {
   todo.fetch();
}
```

```
<!-- ./app/views/todos.xml -->
<Page navigatedTo="load">
	<StackLayout>
    <ListView items="{{ todos }}">
        <ListView.itemTemplate>
        	<GridLayout rows="50">
            <Label text="{{ title }}" />
          </GridLayout>
        </ListView.itemTemplate>
    </ListView>
  </StackLayout>
</Page>

```

