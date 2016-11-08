var AmpersandModel = require("nativescript-ampersand/model");

module.exports = AmpersandModel.extend({

  urlRoot: "https://jsonplaceholder.typicode.com/todos",

  // Properties this model will store
  props: {
    userId: {
      type: 'number'
    },
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