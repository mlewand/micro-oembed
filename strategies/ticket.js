
if ( !global.mediaEmbedJs ) {
	throw new Error ( 'No mediaEmbedJs object in global scope!' );
}

global.mediaEmbedJs.addStrategy( 'ticket', {
	regex: /^\#\d+$/,
	decorator: function( url ) {
		var ticketNumber = url.substring( 1 ),
			ticketLink = '<a href="http://dev.ckeditor.com/ticket/' + ticketNumber + '">#' + ticketNumber + '</a>';

		return 'Ticket ' + ticketLink;
	}
} );