/*$AMPERSAND_VERSION*/
var result = require('lodash/result');
var defaults = require('lodash/defaults');
var includes = require('lodash/includes');
var assign = require('lodash/assign');
var defer = require('lodash/defer');
var qs = require('qs');
var mediaType = require('media-type');
var http = require("http");

// Throw an error when a URL is needed, and none is supplied.
var urlError = function () {
  throw new Error('A "url" property or function must be specified');
};

// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
var methodMap = {
  'create': 'POST',
  'update': 'PUT',
  'patch':  'PATCH',
  'delete': 'DELETE',
  'read':   'GET'
};

module.exports = function (method, model, optionsInput) {
  //Copy the options object. It's using assign instead of clonedeep as an optimization.
  //The only object we could expect in options is headers, which is safely transfered below.
  var options = assign({},optionsInput);
  var type = methodMap[method];
  var headers = {
    "content-type": "application/json",
    "accept": "application/json"
  };

  // Default options, unless specified.
  defaults(options || (options = {}), {

  });

  // Default request options.
  var params = {type: type};

  var ajaxConfig = (result(model, 'ajaxConfig') || {});
  var key;
  // Combine generated headers with user's headers.
  if (ajaxConfig.headers) {
    for (key in ajaxConfig.headers) {
      headers[key.toLowerCase()] = ajaxConfig.headers[key];
    }
  }
  if (options.headers) {
    for (key in options.headers) {
      headers[key.toLowerCase()] = options.headers[key];
    }
    delete options.headers;
  }
  //ajaxConfig has to be merged into params before other options take effect, so it is in fact a 2lvl default
  assign(params, ajaxConfig);
  params.headers = headers;

  // Ensure that we have a URL.
  if (!options.url) {
    options.url = result(model, 'url') || urlError();
  }

  // Ensure that we have the appropriate request data.
  if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.json = options.attrs || model.toJSON(options);
  }

  // If passed a data param, we add it to the URL or body depending on request type
  if (options.data && type === 'GET') {
    // make sure we've got a '?'
    options.url += includes(options.url, '?') ? '&' : '?';
    options.url += qs.stringify(options.data);
    //delete `data` so `xhr` doesn't use it as a body
    delete options.data;
  }

  options.content = options.data;
  if(params.json) options.content = JSON.stringify(params.json);

  // Turn a jQuery.ajax formatted request into xhr compatible
  params.method = params.type;

  var ajaxSettings = assign(params, options);

  // Make the request. The callback executes functions that are compatible
  // With jQuery.ajax's syntax.
  var onComplete = function (err, resp, body) {
    if (err || resp.statusCode >= 400) {
      if (options.error) {
        try {
          body = JSON.parse(body);
        } catch(e){}
        var message = (err? err.message : (body || "HTTP"+resp.statusCode));
        options.error(resp, 'error', message);
      }
    } else {
      // Parse body as JSON
      var accept = mediaType.fromString(params.headers.accept);
      var parseJson = accept.isValid() && accept.type === 'application' && (accept.subtype === 'json' || accept.suffix === 'json');
      if (typeof body === 'string' && (!params.headers.accept || parseJson) && body.length) {
        try {
          body = JSON.parse(body);
        } catch (err) {
          if (options.error) options.error(resp, 'error', err.message);
          if (options.always) options.always(err, resp, body);
          return;
        }
      }
      if (options.success) options.success(body, 'success', resp);
    }
    if (options.always) options.always(err, resp, body);
  };

  var request = http.request(ajaxSettings).then(function (response) {
    var content;
    try {
      content = (response.content) ? response.content.toString() : "";
    } catch(e){}

    defer(onComplete, null, response, content);
  }).catch(function (err) {
    defer(onComplete, err, {});
  });


  if (model) model.trigger('request', model, request, optionsInput, ajaxSettings);
  request.ajaxSettings = ajaxSettings;
  return request;
};
