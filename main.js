
/**
 * This is a sample host in Node.js serving oembed.
 * In this case we've bended its purpose to pass:
 * - ticket numbers
 * - GitHub revision hashes
 * - SVN revisions numbers
 * instead of proper URL
 *
 */

var sys = require( 'sys' ),
	cfg = {
		port: 9090
	},
	urlModule = require( 'url' ),
	httpModule = require( 'http' ),
	Response;

global.mediaEmbedJs = {};

(function() {

	// Various media content strategies, if a "URL" will be positively validated
	// against RegExp, then decorator function should return a html string.
	var contentStrategies = {
		hash: {
			regex: /^git\:[a-zA-Z0-9]+$/,
			decorator: function( url ) {
				var hash = url.substring( 4 ),
					link = '<a href="https://github.com/ckeditor/ckeditor-dev/commit/' + hash + '">' + hash + '</a>';

				return 'Hash: ' + link;
			}
		},
		revision: {
			regex: /^r\d+$/,
			decorator: function( url ) {
				var rev = url.substring( 1 ),
					link = '<a href="http://dev.ckeditor.com/browser/CKEditor/trunk?rev=' + rev + '">' + rev + '</a>';

				return 'Rev: ' + link;
			}
		}
	};

	global.mediaEmbedJs.addStrategy = function( startegyId, strategyObject ) {
		// This function will add new media strategy. It's intended to be called in
		// modules, to split the logic to separate files and provide modularity.
		contentStrategies[ startegyId ] = strategyObject;
	};

	// Inserting strategies encapsulated to modules.
	require( './strategies/ticket' );
	require( './strategies/ckPlugin' );

	/**
	 * httpResponseObject is needed for async operations to close connection
	 */
	Response = function ( url, httpResponseObject, callbackName, responseDelay ) {
		this.setError  = function( errorMessage ) {
			this.error = errorMessage;
			delete this.html;
		};

		this.setHtml = function( html ) {
			this.html = html;
		};

		/**
		 * Serializes object to JSON. It may also produce JSONP if callback name
		 * will be provided.
		 * @param	{String}	jsonpCallback	Callback name. If skipped, normal JSON
		 * will be returned.
		 * @returns	{String}					JSON / JSONP content.
		 */
		this.output = function( jsonpCallback ) {
			var ret = JSON.stringify( this );

			if ( jsonpCallback )
				ret = jsonpCallback + '(' + ret + ');';

			return ret;
		};

		this.setUrl = function( url ) {
			url = String( url );
			this.url = url;

			for ( var i in contentStrategies ) {
				if ( url.match( contentStrategies[ i ].regex ) ) {
					this.setHtml( contentStrategies[ i ].decorator( url, this, httpResponseObject ) );
					break;
				}
			}

			if ( !this.html ) {
				// Nothing was matched...
				this.setError( 'Unknown provider for URL "' + url + '".' );
			}
		};

		this.finish = function() {
			var that = this;
			// Timeout might be used to simulate delayed response.
			setTimeout( function() {
				httpResponseObject.write( that.output( callbackName ) );
				httpResponseObject.end();
			}, responseDelay ? responseDelay * 1000 : 0 );
		};

		this.async = false;

		// Init code.
		if ( url )
			this.setUrl( url );
		else
			this.setError( 'No url given.' );
	};
}());

//// Mock code, which allows to test request without host.
//var response = { end: function(){}, write: function(){} };
//var resp = new Response( 'ck-plugin:quicktable', response, 'CKEDITOR._.oembedCallbacks[0]');

httpModule.createServer( function( request, response ) {

	if ( request.url == '/favicon.ico' )
		return ;

	var url = urlModule.parse( request.url, true ),
		// JSONP encoded callback name (or flase if not given).
		decodedCallbackName = url.query.callback && decodeURIComponent( url.query.callback ),
		resp = new Response( url.query.url, response, decodedCallbackName, url.query.delay );

	console.log( 'Got request to: ' + request.url );
	response.writeHeader( 200, { 'Content-Type': 'text/javascript' } );

	if ( !resp.async ) {
		resp.finish();
	}
} ).listen( cfg.port );

sys.puts( 'Server up and running at port: ' + cfg.port );
