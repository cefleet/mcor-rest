var pg = require('pg');
var pq = require('./private_queries');

//
var delete_item = function(conString,table,params,callback){
	
	var lErr = [];	
	var id = params.id;
	
	//TODO id must not be null
	
	var the_query = function(){
		console.log('It has gotten here');
		var value = '';
		if(lErr.length == 0){
			var client = new pg.Client(conString);
			client.connect();	
			var sql = "DELETE FROM "+table+" WHERE "+pk+" = $1";
			var query = client.query(sql,[id]);
				  		
  			query.on('error', function(err){
  				lErr.push(err);
  			});
  	  	
  			query.on("end", function(){
  				if(lErr.length == 0){
  					callback(null, ["Item Deleted"]);
  				} else {
  					callback(lErr,null);	
  				}
  				client.end();  			
  			});
  			
		} else {
			callback(lErr,null);
		}
	}
	
	pq.get_primary_key(conString,table,function(err,value){
		pk = value;
		the_query();
	});
	
};

module.exports = delete_item;