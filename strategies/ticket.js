
(function() {
	"use strict";

	module.exports = {
		regex: [ /^\#(\d+)$/, /^(?:(?:https?\:\/\/)|(?:www\.)){1,2}dev\.ckeditor\.com\/ticket\/([0-9]+)$/ ],
		decorator: function( url, resp, httpResp, matches ) {
			var ticketNumber = matches[ 1 ],
				ticketLink = '<a href="http://dev.ckeditor.com/ticket/' + ticketNumber + '">#' + ticketNumber + '</a>';

			resp.type = 'rich';

			return 'Ticket ' + ticketLink;
		}
	};
}());