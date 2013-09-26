var fs = require('fs');

//TODO these 2 need to be from a config file situation
var adapter = 'pg';
var conInfo = "postgres://postgres:5432@10.0.0.12/woi_manager";

var action = function(action, table, params, callback){
	fs.exists(__dirname+'/lib/adapters/'+adapter+'/'+action+'.js', function(exists){
		if(exists){
			var thisAction = require('./lib/adapters/'+adapter+'/'+action);
			
			var returnAction = function(err, value){
				callback(err,value);
			}
			
			thisAction(conInfo, table, params, returnAction);	
		
		} else {
			callback('Action Not Found: There is no action named "'+action+'" for the adapter "'+adapter+'"', null);	
		}
	})
	
}

module.exports.action = action;