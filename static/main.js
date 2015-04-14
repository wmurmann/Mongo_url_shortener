$( document ).ready(function() {
	var url = (function (){
        var input = $("#url");
        var submit = $("#submit");
        var init = function()
        {
        	submit.on("click",function(e){
        		e.preventDefault();
        		shorten();
        	});
        };
        var shorten = function (){
        	var url = {url : $("#url").val()};
        	$.ajax({
				type:"POST",
				data: url,
				url: "http://localhost:1337/shorten",
				success: function (response)
				{
					console.log(response);
					$('#url_shortened').val("http://localhost:1337/" + response);
					getNewTopList();
				},
				error: function (response)
				{
					console.log(response);
				}
			});
        };
        var getNewTopList = function (){
        	$.ajax({
				type:"POST",
				url: "http://localhost:1337/topTen",
				success: function (response)
				{
					console.log(response);
					if($("#top_ten_cont").children('li').length < 10)
					{
						$("#top_ten_cont").empty();
						for(var i = 0; i < response.length; i++)
						{
							$("#top_ten_cont").append("<li class=\"top_ten_item\"><div class=\"index\">#"+i+"</div>"+
							"<p class=\"item\"> <span>Origina url </span><a href="+response[i].url+">"+response[i].url+"</a></p>"+
							"<p class=\"item\"><span>Shortend url </span><a href="+response[i].url_short+">"+response[i].url_short+"</a></p>"+
							"<p class=\"item\"><span>Searched </span> "+response[i].searched+" times </p></li>");
						}
					}
					else
					{
						$(".top_ten_item").each(function(list_index) {
							$(this).children(".item").each(function(index){
								if(index == 0)
								{
									$(this).children('a').text(response[list_index].url);
									$(this).children('a').attr('href',response[list_index].url);
								}
								else if(index ==1)
								{
									$(this).children('a').text(response[list_index].url_short);
									$(this).children('a').attr('href',response[list_index].url_short);
								}
								else
								{
									$(this).children('a').text(response[list_index].searched);
									$(this).children('a').attr('href',response[list_index].searched);
								}
							});
						});	
					}



				},
				error: function (response)
				{
					console.log(response);
				}
			});
        };
        return {
        	init: init
        };
    })();
    url.init();
});