
if ( !global.mediaEmbedJs ) {
	throw new Error ( 'No mediaEmbedJs object in global scope!' );
}

var fs = require( 'fs' ),
	httpModule = require( 'http' ),
	cheerioModule = require( 'cheerio' );

global.mediaEmbedJs.addStrategy( 'ckPlugin', {
	regex: /^ck-plugin:(\w+)$/,
	decorator: function( url, resp, httpResp ) {
		var pluginName = url.substring( 10 );

		// This strategy is async, so lets mark response as async, and we'll
		// take care of calling `end()` for the http response.
		resp.async = true;

		var options = {
				host: "ckeditor.com",
				port: 80,
				path: "/addon/" + encodeURIComponent( pluginName )
			},
			content = "",
			req;

		req = httpModule.request(options, function(res) {
			res.setEncoding("utf8");

			res.on("data", function (chunk) {
				content += chunk;
			});

			res.on("end", function () {
				fs.writeFileSync( 'out.html', content, 'utf8' );
				console.log( 'parsing' );
				var addonPage = cheerioModule.load( content ),
					pluginFound = addonPage( '#stats_data' ).length > 0;

				if ( !pluginFound ) {
					console.log( 'plugin not found' );
					resp.setHtml( 'Plugin "' + pluginName + '" not found');
					resp.finish();
					return ;
				}

				var descrParagraphs = addonPage( '#stats_data' ).next().find( 'p' ).slice( 0, 2 );

				// Add-on info readed from page markup.
				var addonInfo = {
					name: addonPage( '#stats_data' ).next().find( 'h2' ).first().text(),
					descr: Array.prototype.map.call( descrParagraphs, function( el ) {
						return addonPage( el ).text() + '';
					} ).join( '\n<br>' ),
					img: addonPage( '.logo' ).css( 'background-image' ).slice( 5, -2 )
				};


				console.log( addonInfo );
				console.log( 'good' );

				resp.setHtml( '<h2>' + addonInfo.name + '</h2>' +
					'<img src="' + addonInfo.img + '" alt="Plugin icon">' +
					'<p>' + addonInfo.descr + '</p>' +
					'<p>Check it out at CKEditor ' +
						'<a href="//' + options.host + options.path  + '" target="_blank">Add-ons Repository</a>' +
					'</p>' );
				resp.finish();
			});
		});

		req.on( 'error', function() {
			console.log( 'Request error occured' );
			resp.setHtml( 'Failed to find ' + pluginName + ' in CKEditor Add-ons repository :(' );
			resp.finish();
		} );

		req.end();

		return ''; // This string won't be used, since it's async request.
	}
} );