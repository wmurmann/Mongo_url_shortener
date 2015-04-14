var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var http = require('http');
var crypto = require('crypto');
var bodyParser = require('body-parser');



mongoose.connection.on('open', function (ref) {
  console.log('Connected to mongo server.');
      
    });

mongoose.connect('mongodb://localhost/url');




var app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'static')));
app.use(bodyParser());
// //app.use(cookieParser());
app.use(express.static(path.join(__dirname,'bower_components')));



//mongoose models
var schema = new Schema({ url: String, url_short : [String], searched  : Number },{ collection : 'urls' });

var URL = mongoose.model('URL', schema);


app.get('/',function (req,res) {
	URL.find({}, null, {sort: {searched : -1}, limit:10}, function(err, docs) {
		if (err) 
		{
			res.render('index');
		}
		else
		{
			console.log(docs);
			var data = [];
			for(var i = 0; i < docs.length; i++)
			{
				var temp = {};
				if(!strStartsWith(docs[i].url,"http://") && !strStartsWith(docs[i].url,"https://") )
				{
					temp.url = ["http://" + docs[i].url];
				}
				else
				{
					temp.url = [docs[i].url];
				}
				temp.url_short = ["http://localhost:1337/" + docs[i].url_short[0]];
				temp.searched = [docs[i].searched];
				data.push(temp);
			}
			res.render('index',{top_ten: data});
		}
	});
});

app.post('/shorten',function (req,res){
	var original_url = req.body.url;
	console.log(original_url);
	URL.find({url:original_url}, 'url', function (err, url) {
		  if (err) 
		  {
		  	return handleError(err);
		  }
		  if(url.length == 0)
		  {
		  	var length_of_url = 5;
		  	if(original_url.length <= 5)
		  	{
		  		res.send(url);//url is short enough
		  	}
			var short_url = randomValueBase64(length_of_url);
			var num = 0;
			var new_url = new URL({ 
									url: original_url,
									url_short:[short_url],
									searched:num
								});
			new_url.save(function (err) {
			    if (err) return handleError(err);
			    else
			  	{
			  		res.send(short_url);
			  	}
			});
		  }
		  else
		  {
		  	res.send(url[0].url_short);
		  }

	});
});

app.get('/:id',function (req,res){
	var url_passed = req.params.id;
	URL.find({url_short:url_passed}, 'url', function (err, url) {
		console.log(url);
		if (err) 
		{
			return handleError(err);
		}
		if(url.length == 1)
		{
			if(!strStartsWith(url[0].url,"http://") && !strStartsWith(url[0].url,"https://") )
			{
				URL.findByIdAndUpdate(
				    url[0].id,
				    {$inc: {searched: 1}},
				    {safe: true},
				    function(err, model) {
				        console.log(err);
				    }
				);
				res.redirect("http://" + url[0].url);
			}
			else
			{
				res.redirect(url[0].url);
			}
		}
		else
		{
			res.send(500,"The url http://localhost:1337/"+req.params.id+" does not exist");
		}
	});
});

app.post('/topTen', function (req,res){
	URL.find({}, null, {sort: {searched : -1}, limit:10}, function(err, docs) {
		if (err) 
		{
			res.json('');
		}
		else
		{
			console.log(docs);
			var data = [];
			for(var i = 0; i < docs.length; i++)
			{
				var temp = {};
				if(!strStartsWith(docs[i].url,"http://") && !strStartsWith(docs[i].url,"https://") )
				{
					temp.url = ["http://" + docs[i].url];
				}
				else
				{
					temp.url = [docs[i].url];
				}
				temp.url_short = ["http://localhost:1337/" + docs[i].url_short[0]];
				temp.searched = [docs[i].searched];
				data.push(temp);
			}
			res.json(data);
		}
	});
});

//create random number in base 64
//code from Tom Pawlak @ http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

app.listen(1337,function(){
	console.log('ready on port 1337');
});

function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}
