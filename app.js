////////////////////////////////////////////////////////////////////////////////////////////////////
// PROCESS
process.q = require('q');
process.request = require('request');
process.backand = require("./node_custom/backand.js");
process.env.APP_CREDENTIALS_FILE = "./credentials.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// BACKAND
// auth
try {
	process.secret = require(process.env.APP_CREDENTIALS_FILE); // exports = { backand: { username: '', password: '', appname: '' } };
} catch(e) {
	process.secret = {};
	process.secret.backand = {
		username: '',
		password: '',
		appname: ''
	};
}

process.backand.auth(process.secret.backand).then(function(){
	// get
	var get = {
		pageSize: 10,
		pageNumber: 1
	};
	process.backand.get('/1/objects/items', get).then(function(data){
		console.log('GET: ',data);
	});

  //post
  var post={
    "name":"my query",
    "sQL":"select * from items",
    "parameters":"",
    "workspaceID":0,
    "precedent":false
  }
  process.backand.post('/1/query/config', post, true).then(function(data){
    console.log('POST: ',data);

    //update the query - put
    var put = {
      "name":"my query-" + Math.floor(Math.random() * 10 + 1)
    };

    process.backand.put('/1/query/config/' + data.iD, put).then(function(data){
      console.log('PUT: ',data);
    });
  });


});