
/* 
 * Copyright 2020 RtBrick Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License.  You may obtain a copy
 * of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/**
 * <h2>UI Client Library</h2>
 * 
 * The client library allows to access and manage resources through their REST API.
 * The <code>Resource</code> class forms the cornerstone of the client library.
 * A fluent API allows to specify the resource URI, callbacks for all common HTTP status codes, and the HTTP request method in an easy-to-read fashion.
 * The <code>Resource</code> class is typically used as base class in order to model the resources of a certain REST API.
 * The resource below is an example resource to access a user profile.
 * <code><pre>
 *  class UserProfile extends Resource {
 *	load(ref){
 *		return this.json("/api/v1/users/me",ref)
 *				   .GET();
 *	}
 *	saveSettings(ref,settings){
 *		return this.json("/api/v1/users/{{&uuid}}",ref)
 *				   .PUT(settings);
 *	}
 *			
 *	passwd(ref,passwd){
 *		return this.json("/api/v1/users/{{&uuid}}/_passwd",ref)
 *					.POST(passwd);
 *	}
 *  }
 *  </code></pre>
 * The user profile resource supports three operations:
 * <ul>
 *  <li><code>load</code> to load the user profile via HTTP GET request</li>
 *  <li><code>saveSettings</code> to update the user profile via HTTP PUT request</li>
 *  <li><code>passwd</code> to change the password via HTTP POST request</li>
 * </ul>
 * <p>
 * A client has basically two options two work with resources: <em>callbacks</em> and <em>promises</em>.
 * </p>
 * 
 * <h3>Resource Callbacks</h3>
 * <p>
 * Resource callbacks must be registered before the resource operation is invoked.
 * All existing callbacks are prefixed with <em>on</em> and documented on the {@link Resource} class.
 * The controller simply initializes the resource, registers the callbacks and eventually invokes the resource operation.
 * </p>
 * <code><pre>
 *  let profile = new UserProfile();
 *  profile.onError=function(messages){
 *  	// Display error messages
 *  };
 *  // Register callback to process the profile settings.
 *  profile.onLoaded=function(settings){
 *  	// Process the user profile
 *  };
 *  // Load user profile
 *  profile.load();
 * </pre></code>
 * 
 * <h3>Resource Promises</h3>
 * All resource operations return a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a> 
 * that can be leveraged in <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function">asynchronous functions</a>
 * to wait for the resource invocation to complete.
 * <code><pre>
 *  async function readProfile(){
 *    let profile = new UserProfile();
 *    let settings = await profile.load();
 *  }
 * </pre></code>
 * 
 * @module
 */

/**
 * A message provides details about the outcome of an operation.
 * @typedef Message
 * @type {Object}
 * @property {String} severity the message severity which is either <code>ERROR</code>,<code>WARNING</code>, or <code>INFORMATION</code>.
 * @property {String} reason a reason code to identify the root cause unambiguously
 * @property {String} message a human-friendly description of the problem
 * @property {String} [property] an optional reference to an object property if the value of this property caused the problem
 */

/**
 * Factory method to create a <code>HttpRequest</code> to invoke a REST-API operation.
 * @param {String} uri the resource URI template
 * @param {Object} [...params] an arbitrary set of objects to resolve the path template variables. The objects are merged into a single object. The right-most object has the highest precedence if multiple objects contain the same properties.
 * @returns {client~HttpRequest} the HTTP request under construction
 */
function http(uri,params) {
	if(params){
		const viewparams = {};
		for(const p in params){
			const v = params[p];
			if(v && v.toISOString){
				viewparams[p] = v.toISOString();
				continue;
			}
			viewparams[p]=v;
		}
		// Mustache is expected to be pre-loaded.
		// Mustache is not available as ES6 module.
		uri = Mustache.render(uri,viewparams);
	}
	uri = encodeURI(uri).replace('+','%2B');
	// Request headers
	const headers = {
		'Accept':'application/json'
	};
	// Response handlers by HTTP status code
	const handlers = {};
	function invoke(method,payload){
		return new Promise((resolved,rejected) => {
			function marshal(payload){
				if(payload && headers['Content-Type'] == 'application/json'){
					return JSON.stringify(payload);
				}
				return payload;
			}
			// Invoke REST API
			fetch(uri, {
			      headers: headers,
  			      method : method,
  			      body : marshal(payload)})
			.then((response) => {
				const processResponseData = function(data){
					// Invoke handler registered for the returned HTTP status code, if any.
					const handler = handlers[response.status];
					if(handler){
						const context = { method:method,
										  uri:uri,
										  status:response.status,
										  headers:response.headers};
						handler.call(context,data);
					}
					// Notify client about the REST API invocation outcome.
					if(200 <= response.status && response.status < 300 ){
						// Successful REST API invocation
						resolved(data);
					} else {
						// Failed REST API invocation
						rejected(data);
					}
				};
				if(response.headers.get('Content-Type') &&
				   response.headers.get('Content-Type').indexOf('application/json') >= 0){
					// Process JSON response
					return response.json()
								   .then(processResponseData);
				}
				// Plain text response
				return response.text()
							   .then(processResponseData);
			})
			.catch((e) => {
				// Critical error (e.g. server not responding)
				//TODO Proper log message
				rejected(e);
			});
		});

	}

	
	/**
	 * HTTP request to invoke a REST API operation.
	 */
	class HttpRequest {
		
		/**
		 * Sets the <code>Accept</code> HTTP request header.
		 * @param {String} mediaType the accept header value
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		accept(mediaType) {
			headers['Accept'] = mediaType;
			return this;
		}
		/**
		 * Sets an arbitrary HTTP request header
		 * @param {String} name the header name
		 * @param {String} value the header value
		 */
		header(name, value) {
			headers[name] = value;
			return this;
		}
		
		/**
		 * Sets the request content type.
		 * @param {String} contentType the content type of the request entity
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		contentType(contentType) {
			headers['Content-Type'] = contentType;
			return this;
		}

		/**
		 * Submits a HTTP GET request to the server-side resource.
		 * @return {Promise} a promise to process the HTTP response
		 */
		GET() {
			return invoke('GET');
		}

		/**
		 * Submits a HTTP POST request to the server-side resource.
		 * @param  {object|string} payload the request entity
		 * @return {Promise} a promise to process the HTTP response
		 */
		POST(payload) {
			return invoke('POST', payload);
		}
		
		/**
		 * Submits a HTTP PUT request to the server-side resource.
		 * @param  {object|string} payload the request entity
		 * @return {Promise} a promise to process the HTTP response
		 */
		PUT(payload) {
			return invoke('PUT', payload);
		}
		
		/**
		 * Submits a HTTP DELETE request to the server-side resource.
		 * @return {Promise} a promise to process the HTTP response
		 */
		DELETE() {
			return invoke('DELETE');
		}
		
		/**
		 * Registers status handlers using the HTTP status code as key and the function to handle the HTTP status code as argument.
		 */
		handlers(handlers){
		    this.handlers = handlers;
		    return this;
		}
		
		/**
		 * Registers a callback to process a <code>400 Bad Request</code> or <code>422 Unprocessable Entity</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onBadRequest(handler) {
			handlers[400] = handler;
			handlers[422] = handler;
			return this;
		}

		/**
		 * Registers a callback to process a <code>500 Internal Server Error</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onInternalServerError(handler) {
			handlers[500] = handler;
			return this;
		}
		
		
        /**
         * Registers a callback to process a <code>502 Bad Gateway</code> HTTP response.
         * @param {HttpRequest~handler} handler the error handler
         * @returns a reference to this <code>HttpRequest</code> to continue with the request building
         */
		onBadGateway(handler){
		    handlers[502] = handler;
		    return this;
		}
		
		/**
		 * Registers a callback to process a <code>409 Conflict</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onConflict(handler) {
			handlers[409] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>410 Gone</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onGone(handler) {
			handlers[410] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>201 Created</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onCreated(handler) {
			handlers[201] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>202 Accepted</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onAccepted(handler){
			handlers[202] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a HTTP redirects.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onRedirect(handler){
			handlers[302] = handler;
			handlers[303] = handler;
			handlers[307] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>200 OK</code> or <code>204 No Content</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onSuccess(handler) {
			handlers[200] = handler;
			handlers[204] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>405 Method Not Allowed</code> response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onMethodNotAllowed(handler){
			handlers[405] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>401 Unauthorized</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onUnauthorized(handler) {
			handlers[401] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>412 Precondition Failed</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onPreconditionFailed(handler){
			handlers[412] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>403 Forbidden</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onForbidden(handler) {
			handlers[403] = handler;
			return this;
		}
		
		/**
		 * Registers a callback to process a <code>404 Not Found</code> HTTP response.
		 * @param {HttpRequest~handler} handler the error handler
		 * @returns a reference to this <code>HttpRequest</code> to continue with the request building
		 */
		onNotFound(handler) {
			handlers[404] = handler;
			return this;
		}
	};
	return new HttpRequest();
}

/** 
 * Merges an arbitrary number of objects into a single object. <code>null</code> references are ignored.
 * @param {...Object} objects the objects to merge. The right-most object has the highest precedence
 */
export function merge(){
	if(arguments.length == 1){
		return arguments[0];
	}
	const union = {};
	Array.from(arguments).forEach(function(argument){
		if(argument && typeof argument === 'object'){
			for(const p in argument){
				const v = argument[p];
				if(v){
					union[p] = v;
				}
			}
		}
	});
	return union;
}

/**
 * A generic client to access a server-side resource through a REST API.
 * <p>
 * The <code>Resource</code> class provides a set of callback methods to process
 * common HTTP status codes as well as methods to access resources of arbitrary content types.
 * The resource returns an initialized HTTP call that supplies methods to submit a HTTP GET, HTTP POST, HTTP PUT, and HTTP DELETE requests.
 */
export class Resource {
	
	/**
	 * Creates a new <code>Resource</code> instance.
	 */
	constructor(){
		/**
		 * Input error callback.
		 * <p>
		 * This callback is invoked when the server was not able to process the request entity and responded with <code>400 Bad Request</code>
		 * or <code>422 Unprocessable Entity</code>. 
		 * The resource calls the <code>onError</code> callback if no <code>onInputError</code> callback was registered.
		 * </p>
		 * @param {Message[]} messages a message array that provides details about why the request entity cannot be processed
		 */
		this.onInputError = null;
		
		/**
		 * 
		 * Conflict error callback.
		 * <p>
		 * This callback is invoked when server responded with <code>409 Conflict</code> because the request conflicts with the server-side state of the resource.
		 * The resource calls the <code>onError</code> callback if no <code>onInputError</code> callback was registered.
		 * </p>
		 * @param {Message[]} messages a message array that provides details about why the request conflicts with the server-side resource state
		 */
		this.onConflict = null;
		
		/**
		 * Resource gone callback.
		 * <p>
		 * This callback is invoked when a requested resource does not exist anymore and the server responded with <code>410 Gone</code>.
		 * This callback calls the <code>onRemoved</code> callback by default and invokes the <code>onError</code> if no <code>onRemoved</code> callback was specified.
		 * </p>
		 * @param {Message} message a message that provides details about what resources was attempted to access
		 */
		this.onGone = null;
		
		
		/**
		 * Method not allowed callback.
		 * <p>
		 * This callback is invoked when the server responded with <code>405 Method Not Allowed</code> because the resource does not accept the specified HTTP request method.
		 * The resource calls the <code>onError</code> callback if no <code>onMethodNotAllowed</code> callback was specified.
		 * </p>
		 * @param {Message} message a message that provides details about what resources was attempted to access
		 */
		this.onMethodNotAllowed = null;
		
		
		/**
		 * Precondition failed callback.
		 * <p>
		 * This callback is invoked when the server responded with a <code>412 Precondition Failed</code> response, because a condition 
		 * specified in a <code>If-Match</code>,<code>If-None-Match</code>, <code>If-Modified-Since</code>, or <code>If-Not-Modified-Since</code> 
		 * header is not satisfied.
		 * The resource calls the <code>onError</code> callback if no <code>onPreconditionFailed</code> callback was specified.
		 * </p>
		 * @param {Message} message a message that provides details about what pre-condition failed
		 */
		this.onPreconditionFailed=null;
		
		/**
		 * Resource loaded callback.
		 * <p>
		 * This callback is invoked if a resource was loaded, i.e. the server responded with a <code>200 OK</code> to a <code>HTTP GET</code> request.
		 * The resource calls the <code>onSuccess</code> callback if no <code>onLoaded</code> callback was specified.
		 * </p>
		 * @param {String|Object} entity The response entity as JSON object (for <code>appliation/json</code> MIME type) or the entity's raw data (for all other MIME types).
		 */
		this.onLoaded=null;
		
		/**
		 * Resource created callback.
		 * <p>
		 * This callback is invoked when the server responses with <code>201 Created</code> because a new resource was created on the server.
		 * The resource invokes the <code>onSuccess</code> callback if no <code>onCreated</code> callback was specified.
		 * @param {String} location The location (URI) of the created resource
		 */
		this.onCreated;

		/**
		 * Resource removed callback.
		 * <p>
		 * This callback is invoked when a resource has been successfully removed from a server, i.e. the server responded with <code>200 OK</code> or <code>204 No Content</code> to a <code>HTTP DELETE</code> request.
		 * The resource calls the <code>onSuccess</code> callback if no <code>onRemoved</code> callback was specified.
		 * @param {Message[]} [messages] messages that provide details about the removed resource
		 */
		this.onRemoved;
		
		/**
		 * Resource updated callback.
		 * <p>
		 * This callback is invoked when an existing resources has been updated, i.e. the server responded with <code>200 OK</code> or <code>204 No Content</code> to a <code>HTTP PUT</code> or <code>HTTP POST</code> operation. 
		 * The resource calls the <code>onSuccess</code> callback if no <code>onUpdate</code> callback was specified.
		 * <p>
		 * @param {Message[]} [messages] messages that provide details about what resource was updated
		 */
		this.onUpdated = null;
		
		/**
		 * Request accepted callback.
		 * <p>
		 * This callback is invoked when the server responded with <code>201 Accepted</code> because the resource has accepted a request but the execution has been deferred. 
		 * The resource calls the <code>onSuccess</code> callback if not <code>onAccepted</code> callback was specified.
		 * </p>
 		 * @param {Messages[]} [messages] messages that provide details about the scheduled operation
		 */
		this.onAccepted = null;
		
		
		/**
		 * Caller unauthorized callback.
		 * <p>
		 * This callback is invoked when the server responded with <code>401 Unauthorized</code> because the caller is not authorized to execute the request.
		 * The resource calls the <code>onError</code> callback if no <code>onUnauthorized</code> callback was specified.
		 * 
		 * @param {Message} message a message that provides details about the attempted operation
		 */
		this.onUnauthorized = function(message){
			window.dispatchEvent(new CustomEvent('ClientUnauthenticated',{'detail':message}));
		};
		
		/**
		 * Operation forbidden callback.
		 * <p>
		 * This callback is invoked when the server responded with <code>403 Forbidden</code> because the caller is not allowed to execute the request.
		 * The resource calls the <code>onError</code> callback if no <code>onForbidden</code> callback was specified.
		 * 
		 * @param {Message} message a message that provides details about the attempted operation
		 */
		this.onForbidden = function(message){
			window.dispatchEvent(new CustomEvent('ClientForbidden',{'detail':message}));
		};
		
		/**
		 * Resource not found callback.
		 * <p>
		 * This callback is invoked when the server responded with <code>404 Not Found</code> because the requested resource does not exist.
		 * The resource calls the <code>onError</code> callback if no <code>onNotFound</code> callback was specified. 
		 * In addition, the resource fires a custom <code>ResourceNotFound</code> event by default if a resource does not exist. 
		 * This event is not fired if a custom <code>onNotFound</code> callback was specified.
		 * 
		 * @param {Message} message a message that provides details about which resource was not found
		 */
		this.onNotFound = function(messages){
			window.dispatchEvent(new CustomEvent('ResourceNotFound',{'detail':messages}));
		}
		
		
		/**
		 * Error callback.
		 * <p>
		 * This callback is invoked in case of an error, unless a more-applicable error callback exists.
		 * The error callback fires a custom <code>ResourceError</code> event by default. 
		 * This event is not fired if a custom <code>onError</code> callback was specified.
		 * @param {Message|Message[]} message a message or an array of messages that provides details about the error
		 */
		this.onError = function(message){
			window.dispatchEvent(new CustomEvent('ResourceError'),{'detail':message});
		}
		
		/**
		 * Success callback.
		 * <p>
		 * This callback is invoked for all successful operations, unless a more-applicable success callback exists.
		 * @param {String|Object|Message|Message[]} response the response of the successful operation, which is either the URI of a created resource, the response entity, or messages that describe the outcome of an operation
		 */
		this.onSuccess = function() {};
		
		/**
		 * Bad gateway callback.
		 * <p>
		 * This callback is invoked if the server reponses with a bad gatway error message.
		 */
		this.onBadGateway = null;
	}


	/**
	 * Returns a prepared HTTP call to submit a GET, PUT, POST, or DELETE request.
	 * <p>
	 * The <code>Accept</code> and <code>Content-Type</code> header must be set before submitting the request.
	 * The <code>Resource<code> class therefore provides the {@see #json()}, {@see #plainText()}, and {@see #html()} 
	 * convenience methods to access commonly used resource types.
	 * </p>
	 * @param {String} path a path template to compute the request URI
	 * @param {Object} [...params] an arbitrary set of objects to resolve the path template variables. The objects are merged into a single object. The right-most object has the highest precedence if multiple objects contain the same properties.
	 * @returns {client~HttpRequest} the prepared HTTP call
	 */
	resource() {
		const path = arguments[0];
		const params = (arguments.length == 2) ? arguments[1] : merge.apply(this,[...arguments].slice(1));
		// Event handlers are always invoked in the scope of the XMLHTTPRequest to
		// have access to the request and response. resource reference is needed to
		// forward the event to the proper event handler.
		function dispatchResponse(resource){
			return function(){
				if(this.method == 'GET'){
					if(resource.onLoaded){
						resource.onLoaded.apply(this,arguments);
						return;
					}
					if(resource.onSuccess){
						resource.onSuccess.apply(this,arguments);
					}
					return;
				}
				if(this.method == 'POST' || this.method == 'PUT'){
					if(resource.onUpdated){
						resource.onUpdated.apply(this,arguments);
						return;
					}
					if(resource.onSuccess){
						resource.onSuccess.apply(this,arguments);
					}
					return;
				}
				if(this.method == 'DELETE'){
					if(resource.onRemoved){
						resource.onRemoved.apply(this,arguments);
						return;
					}
					if(resource.onSuccess){
						resource.onSuccess.apply(this,arguments);
					}
					return;
				}
				// Catch all
				if(resource.onSuccess){
					resource.onSuccess.apply(this,arguments);
				}
			};
		};	
		
		return http(path,params)
			   .onAccepted(this.onAccepted ? this.onAccepted : this.onSuccess)
			   .onCreated(this.onCreated ? this.onCreated : this.onSuccess)
			   .onGone(this.onRemoved ? this.onRemoved : this.onError)
			   .onMethodNotAllowed(this.onMethodNotAllowed ? this.methodNotAllowed : this.onError)
			   .onSuccess(dispatchResponse(this))
			   .onBadRequest(this.onInputError ? this.onInputError : this.onError)
			   .onConflict(this.onConflict ? this.onConflict : this.onError)
			   .onInternalServerError(this.onError)
			   .onBadGateway(this.onBadGateway)
			   .onForbidden(this.onForbidden ? this.onForbidden : this.onError)
			   .onUnauthorized(this.onUnauthorized ? this.onUnauthorized : this.onError)
			   .onNotFound(this.onNotFound ? this.onNotFound : this.onError);
	};

	/**
	 * Returns an initialized HTTP call to access a JSON resource.
	 * <p>
	 * The <code>Content-Type</code> and the <code>Accept</code> header are set to <code>application/json</code> and a converter to transform the response JSON string into an object has been added.
	 * </p>
	 * @param {String} path a path template to compute the request URI
	 * @param {Object} [...params] an arbitrary set of objects to resolve the path template variables. The objects are merged into a single object. The right-most object has the highest precedence if multiple objects contain the same properties.
	 * @returns {client~HttpRequest} the prepared HTTP call
	 */
	json() {
		return this.resource.apply(this,arguments)
				   .contentType('application/json')
		           .accept('application/json')
	};


	/**
	 * Returns an initialized HTTP call to access a JSON resource.
	 * <p>
	 * The <code>Accept</code> header is set to <code>text/plain</code>.
	 * </p>
	 * @param {String} path a path template to compute the request URI
	 * @param {Object} [...params] an arbitrary set of objects to resolve the path template variables. The objects are merged into a single object. The right-most object has the highest precedence if multiple objects contain the same properties.
	 * @returns {client~HttpRequest} the prepared HTTP call
	 */
	plainText() {
		return this.resource.apply(this,arguments)
				   .accept('text/plain');
	};
	
	
	/**
	 * Returns an initialized HTTP call to access a JSON resource.
	 * <p>
	 * The <code>Accept</code> header is set to <code>text/html</code>.
	 * </p>
	 * @param {String} path a path template to compute the request URI
	 * @param {Object} [...params] an arbitrary set of objects to resolve the path template variables. The objects are merged into a single object. The right-most object has the highest precedence if multiple objects contain the same properties.
	 * @returns {client~HttpRequest} the prepared HTTP call
	 */
	html(){
		return this.resource.apply(this,arguments)
				   .accept('text/html');
	};
}

/**
 * A generic JSON resource to read arbitrary JSON resources.
 */
export class Json extends Resource  {
	
	/**
	 * Creates a new JSON resource.
	 * @param {String} uri the resource URI template
	 * @param {Object} config the default template variable values
	 */
	constructor(uri,cfg){
		super();
		this._uri = uri;
		this._cfg = cfg;
	}
	
	/**
	 * Loads the JSON resource.
	 * @param {Object} [params] optional parameters to overwrite the default template variables
	 * @returns {Promise} a promise to process the resource or reported errors
	 */
	load(params) {
		// Using resource rather than JSON because Content-Type must not be application/json for CORS requests.
		// Set fetch API documentation for further information.
		return this.resource(this._uri,
						     this._cfg,
						     params)
					.accept('application/json')
				    .GET();
	}
	
	

	
}


 
