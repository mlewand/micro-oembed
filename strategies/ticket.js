
(function() {
	"use strict";

	module.exports = {
		regex: /^\#\d+$/,
		decorator: function( url ) {
			var ticketNumber = url.substring( 1 ),
				ticketLink = '<a href="http://dev.ckeditor.com/ticket/' + ticketNumber + '">#' + ticketNumber + '</a>';

			return 'Ticket ' + ticketLink;
		}
	};
}());