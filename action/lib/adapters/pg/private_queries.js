var pg = require('pg');

var get_columns = function(conString,table, callback){
	var client = new pg.Client(conString);
	client.connect();
	var lErr = [];
	var rows = [];
	var sql = 'SELECT column_name,data_type from information_schema.columns as "columns" where table_name=\''+table+'\'';
	  		
  	var query = client.query(sql);
		  		
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
}

var get_primary_key = function(conString,table, callback){
	var client = new pg.Client(conString);
	client.connect();
	var lErr = [];
	var pk = '';
	var sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS , INFORMATION_SCHEMA.KEY_COLUMN_USAGE "+
		       "WHERE  INFORMATION_SCHEMA.TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'PRIMARY KEY' "+
			   "AND INFORMATION_SCHEMA.KEY_COLUMN_USAGE.CONSTRAINT_NAME = INFORMATION_SCHEMA.TABLE_CONSTRAINTS.CONSTRAINT_NAME "+ 
			   "AND INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_NAME = INFORMATION_SCHEMA.TABLE_CONSTRAINTS.TABLE_NAME "+ 
			   "AND INFORMATION_SCHEMA.TABLE_CONSTRAINTS.TABLE_SCHEMA = INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_SCHEMA "+  
			   "AND INFORMATION_SCHEMA.TABLE_CONSTRAINTS.TABLE_NAME = '"+table+"' "+
			   "AND INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_CATALOG = 'woi_manager'";
  	var query = client.query(sql);
		  		
  	query.on('error', function(err){
  		lErr.push(err);
  	});
  	
  	query.on('row', function(row){
  		pk = row.column_name;
  	});
  	
  	query.on("end", function(){
  		if(lErr.length == 0){
  			callback(null, pk);
  		} else {
  			callback(lErr,null);	
  		}
  		client.end();  			
  	});
}

module.exports.get_columns = get_columns;
module.exports.get_primary_key = get_primary_key;