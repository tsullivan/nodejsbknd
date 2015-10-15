/*
	DEPENDENCIES:
	process.request = require('request');
	process.q = require('q');

	USE:
	process.backand = require("./node_custom/backand.js");
	process.backand.auth({ username:'a@b.c', password:'etc', appname:'test' })
		.then(function(){
			process.backand.get('/1/objects/advertisement?pageSize=1&pageNumber=1').then(function(data){
				console.log('Data: ',data);
			});
		});
*/

exports.auth = function(settings){
	var backand = this;
	var deferred = process.q.defer();
	backand.settings = {};
	process.request(
		{
			url: 'https://api.backand.com/token',
			method: "POST",
			form: {
				username: settings.username,
				password: settings.password,
				appname: settings.appname,
				grant_type: 'password'
			}
		},
		function(error, response, data) {
			data = backand.handleResponse(deferred, error, response, data)
			if (!data) {
				return false;
			}
			backand.settings.access_token = 'Bearer '+data.access_token;
		}
	);
	return deferred.promise;
};

exports.get = function(uri, data){
	var backand = this;
	var deferred = process.q.defer();
	if (data) {
		data = '?'+toQueryString(data);
	}

  process.request(
    {
      method: 'GET',
      url: 'https://api.backand.com' + uri + data,
      json:{},
      headers: {
        'Authorization': backand.settings.access_token
      }
    }
  ,
  function(error, response, data) {
		data = backand.handleResponse(deferred, error, response, data)
		if (!data) {
			return false;
		}
	});
	return deferred.promise;
};

exports.post = function(uri, json, returnObject){
	var backand = this;
	var deferred = process.q.defer();
  var ret = returnObject ? '?returnObject=true' : '';
	process.request(
		{
			method: 'POST',
			url: 'https://api.backand.com'+ uri + ret,
      json: json,
			headers: {
				'Authorization': backand.settings.access_token
			}
		},
		function(error, response, data) {
			data = backand.handleResponse(deferred, error, response, data)
			if (!data) {
				return false;
			}
		}
	);
	return deferred.promise;
};

exports.put = function(uri, json){
  var backand = this;
  var deferred = process.q.defer();
  process.request(
      {
        method: 'PUT',
        url: 'https://api.backand.com'+uri,
        json: json,
        headers: {
          'Authorization': backand.settings.access_token
        }
      },
      function(error, response, data) {
        data = backand.handleResponse(deferred, error, response, data)
        if (!data) {
          return false;
        }
      }
  );
  return deferred.promise;
};

exports.handleResponse = function(deferred, error, response, data){
	if (error) {
		console.error('Error: ', error);
		deferred.reject(error);
		return false;
	}
	if (response.statusCode != 200) {
	      error = 'Status code: "'+response.statusCode+'"';
		console.error('Error: ', error);
		deferred.reject(error);
		return false;
	}
	if (data) {
    try{
		  data = JSON.parse(data);
    }
    catch(e){}
		deferred.resolve(data);
		return data;
	}
};

var toQueryString = function(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
};