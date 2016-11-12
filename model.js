var Observable = require("data/observable").Observable;
var assign = require('lodash/assign');
var includes = require('lodash/includes');
var AmpersandModel = require("./lib/ampersand-model");

// Extend Nativescript's Observable object
var Base = (function (_super) {
  __extends(Base, _super);
  function Base(json) {
    _super.call(this);
    AmpersandModel.apply(this, arguments);
  }

  return Base;
})(Observable);

function getAllDefinedProperties( obj, omit) {
  omit = omit || [];
  var props = {};

  do {
    Object.getOwnPropertyNames( obj ).forEach(function ( prop ) {
      if ( !props[prop] && !includes(omit, prop)) {
        props[prop] = Object.getOwnPropertyDescriptor(obj, prop)
      }
    });
  } while ( obj = Object.getPrototypeOf( obj ) );

  return props;
}

// Copy all Ampersand defined properties
Object.defineProperties(Base.prototype, getAllDefinedProperties(AmpersandModel.prototype, ["constructor"]));

assign(Base, AmpersandModel);

assign(Base.prototype, {
  trigger: function (event, model, value) {
    var ret = AmpersandModel.prototype.trigger.apply(this, arguments);

    if (event.startsWith("change:")) {
      var key = event.split(":")[1];
      this.notifyPropertyChange(key, value);
    }

    return ret;
  }
});

module.exports = Base;