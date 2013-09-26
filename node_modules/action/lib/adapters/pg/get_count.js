var pg = require('pg');

var get_count = function(conString,table,params,callback){
	var lErr = [];
	var options = {
		search:'',
		fields: params.fields || '*',
		conditions:''		
	}
	
	var p = 1;
	var pValues = [];
	
	//sets up searching
	if(params.hasOwnProperty('search')){
		if(options.fields != '*'){
			var searchValue = '';
			var fields = options.fields.split(',');
			var len = fields.length;
			for(var i = 0; i<len; i++){
				searchValue = searchValue+"LOWER("+fields[i]+"::TEXT) LIKE LOWER($1)";
				if(i != (len-1)){
					searchValue = searchValue+' OR ';
				}
			}
			options.search = ' AND ('+searchValue+')';
			pValues.push("%"+params.search+"%");
			p++; 
		} else {
			lErr.push({'application error': 'The "fields" query string is needed in order to search'});
		}
	};
	
	//sets up conditions
	if(params.hasOwnProperty('conditions')){
		var conditionsValue = '';
		var colCon = params.conditions.split(',');
		var len = colCon.length;
		for(var i = 0; i<len; i++){
			var keyVal = colCon[i].split(':');
			//If it is not exactly 2 there is a problem
			if(keyVal.length != 2){
				lErr.push({'application error':'The conditions query string is malformed'})
			} else {
				var field = keyVal[0];
			
				//turns the optional values into an array
				var keyOptions = keyVal[1].split(';');
				var pArized = [];
				for(var j = 0; j<keyOptions.length; j++){
					pArized.push('$'+p);
					pValues.push(keyOptions[j]);
					p++;					
				}				
				//then joins them back together
				var merged = "("+pArized.join(",")+")";
				conditionsValue = conditionsValue+field+' IN '+merged;
				if(i != (len-1)){
					//TODO need to have an option for OR and AND
					conditionsValue = conditionsValue+' AND ';
				}
				options.conditions = ' AND ('+conditionsValue+')';
			}
		}		
	};
	
	if(lErr.length == 0){
		var client = new pg.Client(conString);
		client.connect();	
		var rows = [];
		var sql ='SELECT count(*) AS '+table
			+' FROM '+table
			+' WHERE 1=1'
			+options.search
			+options.conditions;
			
		var query = client.query(sql,pValues);
		  		
  		query.on('error', function(err){
  			lErr.push(err);
  		});
  	
  		query.on('row', function(row){
  			rows.push(row);
  		});
  	
  		query.on("end", function(){
  			if(lErr.length == 0){
  				callback(null, rows);
  			} else {
  				callback(lErr,null);	
  			}
  			client.end();  			
  		});
  		
	} else {
		callback(lErr,null);
	}
}

module.exports = get_count;