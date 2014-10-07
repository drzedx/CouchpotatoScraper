var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var Q= require('q');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');

var users =['megalide69', 'ignazio71'];

var headers = {
  "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
  "accept-language" : "en-US,en;q=0.8",
  "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
  "accept-encoding" : "gzip, deflate",
};


function parseRSS(user,imdb) {
	var deferred = Q.defer();
	var options = {
		url: 'https://kickass.to/usearch/user:'+user+'%20imdb:'+imdb+'/?rss=1',
		headers: headers,
		encoding: null
	};
	request(options, function (error, response, html) {
		var results=[];
		if (!error && response.statusCode == 200) {
			var res = html.toString('utf-8').replace(/torrent:/g,'');
			var $ = cheerio.load(res, {
				xmlMode: true
			});
			$('item').each(function(i, element){
				var metadata = {
					release_name: $(this).children('title').text(),
					torrent_id: i,
					details_url: $(this).children('guid').text(),
					download_url: $(this).children('magnetURI').text(),
					imdb_id: 'tt'+imdb,
					type: 'movie',
					freeleech: true,
					size: Math.round(parseInt($(this).children('contentLength').text())/1024/1024),
					leechers: parseInt($(this).children('peers').text()),
					seeders: parseInt($(this).children('seeds').text())				
				};
				results.push(metadata);
			});
		}
		deferred.resolve(results);
	});
	
	return deferred.promise;
}

function searchMovie(imdb) {
	var deferred = Q.defer();
	var promises = [];
	var response = {
		results: [],
		total_results:0
	};
	for(index=0 ; index < users.length; ++index){
		promises.push(parseRSS(users[index],imdb));
	}
	
	Q.all(promises).then(function(ret){
		for(index=0 ; index < users.length; ++index){
			var temp = ret[index];
			response.total_results += temp.length;
			for(j=0; j < temp.length; ++j)
				response.results.push(temp[j]);
		}
		deferred.resolve(response);
	});
	
	return deferred.promise;
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/', function(req,res){
	var imdb= req.query.imdbid.replace('tt','');
	searchMovie(imdb).then(function(film){
		res.json(film);
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});