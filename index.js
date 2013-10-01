var dbQueries = require('action');

var Rest = function Rest(req,res,callback){
	this.req = req;
	this.res = res;
	this.action = this.req.params.action;
	this.table = this.req.params.table;
	this.callback = callback;
	
};

//TODO need to have some sort of check for validity of the Request
Rest.prototype = {	
	restGET : function(){
		dbQueries.action(
			this.action, 
			this.table, 
			this.req.query, 
			this.returnOutput.bind(this)
		);
	},
	
	restPOST : function(){	
		dbQueries.action(
			this.action, 
			this.table, 
			this.req.body.params, 
			this.returnOutput.bind(this)
		);
	},
	
	restPUT : function(){
		var params = {};		
		for(var item in this.req.query){
			params[item] = this.req.query[item];
		}
	
		params.bodyParams = this.req.body.params;
		
		dbQueries.action(
			this.action, 
			this.table, 
			params, 
			this.returnOutput.bind(this)
		);
	},
	
	restDELETE : function(){
		dbQueries.action(
			this.action, 
			this.table, 
			this.req.query, 
			this.returnOutput.bind(this)
		);
	},

	returnOutput: function(err, values){
		if(err == null){
			//TODO JSONFIY this
			this.res.header('Content-Type', 'application/json');
			this.res.jsonp(values);
		} else {
			this.res.send(err);
		}
		this.callback();
	}
}


var request = function(req,res,callback){	
	
	//selects the function name
	var fName = 'rest'+req.method;
	
	//this seems a little redundant but ill let it stand so it comes back to this
	/*var returnF = function(){
		callback();
	}*/
	
	//runs the correct function
	var myRest = new Rest(req,res,callback);
	myRest[fName]();
	
}

module.exports.request = request;
