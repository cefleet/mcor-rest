var pg = require('pg');
var pq = require('./private_queries');

var get_single = function(conString,table,params,callback){
	var lErr = [];
	var options = {
		id: params.id || null,
		fields: params.fields || '*'
	}
		
	var the_query = function(){
		var value = '';
		if(lErr.length == 0){
			var client = new pg.Client(conString);
			client.connect();	
			var item = '';
			var sql ='SELECT '+options.fields
				+' FROM '+table
				+' WHERE 1=1 AND id::TEXT = $1::TEXT LIMIT 1';
  	
  			var query = client.query(sql,[options.id]);
		  		
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
			//doesnt' even attempt to do the query if somethign is that wrong'
			callback(lErr,null);
		}
	}
	
	if(options.id == null){
		lErr.push({'application error':'the "id" query string must be specified'});
		the_query();
	} else {
		pq.get_primary_key(conString,table,function(err,value){
			
			if(options.fields != '*'){
				var fields = options.fields.split(',');
				if(fields.indexOf(value) == -1){
					options.fields = value+','+options.fields;
				}
			}				
			the_query();
		});
		
	}
}

module.exports = get_single;