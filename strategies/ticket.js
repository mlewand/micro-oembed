
(function() {
	"use strict";

	var fs = require( 'fs' ),
		httpModule = require( 'http' ),
		cheerioModule = require( 'cheerio' );


	function fetchTicketInfo( ticketNumber, resp, callback ) {

		var options = {
				host: 'dev.ckeditor.com',
				port: 80,
				path: '/ticket/' + encodeURIComponent( ticketNumber )
			},
			content = '',
			req;

		req = httpModule.request(options, function(res) {
			res.setEncoding('utf8');

			res.on('data', function (chunk) {
				content += chunk;
			});

			res.on('end', function () {
				fs.writeFileSync( 'out.html', content, 'utf8' );

				var loadedPage = cheerioModule.load( content ),
					// Info readen from page markup.
					info = {
						title: loadedPage( 'h2.summary' ).text(),
						owner: String( loadedPage( 'div#ticket td[headers="h_owner"]' ).text() ).trim(),
						descr: String( loadedPage( 'div#ticket div.description div.searchable' ).first().html() ).trim()
					};

				if ( !info.title ) {
					console.log( 'Ticket not found' );
					resp.setHtml( 'Ticket ' + ticketNumber + ' could not be found' );
					resp.finish();
					return;
				}

				callback( info );
			});
		});

		req.on( 'error', function() {
			console.log( 'Ticket request error occured' );
			resp.setHtml( 'Failed to find issue ' + ticketNumber );
			resp.finish();
		} );

		req.end();
	};

	module.exports = {
		regex: [ /^\#(\d+)$/, /^(?:(?:https?\:\/\/)|(?:www\.)){1,2}dev\.ckeditor\.com\/ticket\/([0-9]+)$/ ],
		decorator: function( url, resp, httpResp, matches ) {
			var ticketNumber = matches[ 1 ],
				ticketLink = '<a href="http://dev.ckeditor.com/ticket/' + ticketNumber + '">#' + ticketNumber + '</a>';

			resp.async = true;

			fetchTicketInfo( ticketNumber, resp, function( info ) {
				console.log( 'Ticket ' + ticketNumber + ' loaded.' );
				resp.type = 'rich';
				resp.setHtml( '<section>' +
						'<h1>Issue #' + ticketNumber + ': ' + info.title + '</h1>' +
						'<div>' + info.descr + '</div>' +
					'</section>' );
				resp.finish();
			} );


			return 'Ticket ' + ticketLink;
		}
	};
}());