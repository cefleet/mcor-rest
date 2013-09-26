var pg = require('pg');
var pq = require('./private_queries');

//
var update_item = function(conString,table,params,callback){
	
	var lErr = [];
	
	var fields = JSON.parse(params.bodyParams);
	var id = params.id;
	var pSets = [];
	var pValues = [];
	var pk  = '';
	var i = 1;
	
	//TODO an id is required
	for(var field in fields){
		if(typeof fields[field] === 'object'){
			fields[field] = JSON.stringify(fields[field]);
		}		
		pSets.push(field+"=$"+i);		
		pValues.push(fields[field].replace("'","''"));
		i++;
	}
	
	var the_query = function(){
		var value = '';
		if(lErr.length == 0){
			var client = new pg.Client(conString);
			client.connect();	
			var item = '';
			var sql = "UPDATE "+table+" SET "+pSets.join(',')+" WHERE "+pk+" = '"+id+"' RETURNING "+pk;
			var query = client.query(sql,pValues);		  		
  			query.on('error', function(err){
  				lErr.push(err);
  			});
  	
  			query.on('row', function(row){
  				value = row;
  			});
  	
  			query.on("end", function(){
  				if(lErr.length == 0){
  					callback(null, value);
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

module.exports = update_item;