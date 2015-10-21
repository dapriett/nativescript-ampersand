var ObservableArray = require("data/observable-array").ObservableArray;
var _ = require("lodash");
var BaseModel = require("./model");
var AmpersandCollection = require("./lib/ampersand-rest-collection");

// Extend Nativescript's ObservableArray
var Base = (function (_super) {
  __extends(Base, _super);
  function Base(json) {
    _super.call(this);
    AmpersandCollection.apply(this, arguments);
    this._array = null;
  }

  return Base;
})(ObservableArray);

function getAllDefinedProperties( obj, omit) {
  omit = omit || [];
  var props = {};

  do {
    Object.getOwnPropertyNames( obj ).forEach(function ( prop ) {
      if ( !props[prop] && !_.contains(omit, prop)) {
        props[prop] = Object.getOwnPropertyDescriptor(obj, prop)
      }
    });
  } while ( obj = Object.getPrototypeOf( obj ) );

  return props;
}

// Copy all Ampersand defined properties
Object.defineProperties(Base.prototype, getAllDefinedProperties(AmpersandCollection.prototype, ["constructor"]));

_.assign(Base, AmpersandCollection);

_.assign(Base.prototype, {
  model: BaseModel,
  trigger: function (event, model, collection, options) {
    var ret = AmpersandCollection.prototype.trigger.apply(this, arguments);

    if (event === 'add') {
      this._addArgs.index = this.indexOf(model);
      this._addArgs.addedCount = 1;
      this.notify(this._addArgs);
      this._notifyLengthChange();
    }

    else if (event === 'remove') {
      this._deleteArgs.index = options.index;
      this._deleteArgs.removed = [model];
      this.notify(this._deleteArgs);
      this._notifyLengthChange();
    }

    else if (event === 'change') {
      this.notify({
        eventName: "change",
        object: this,
        action: "update",
        index: this.indexOf(model),
        removed: new Array(1),
        addedCount: 1
      });
    }

    else if (event === 'reset' || event === 'sort') {
      this.notify({
        eventName: "change", object: this,
        action: "update",
        index: 0
      });
    }

    return ret;
  },
  _notifyLengthChange: function () {
    var lengthChangedData = this._createPropertyChangeData("length", this.length);
    this.notify(lengthChangedData);
  },
  getItem: function (index) {
    return this.at(index);
  }

});

Object.defineProperty(Base.prototype, "_array", {
  get: function () {
    throw Error("Observable method not allowed - use Ampersand rest collection methods");
  }
});

module.exports = Base;