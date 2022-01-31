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
 * <h2>UI Core Library</h2>
 * 
 * The UI core library contains the core components of the Leitstand UI framework, which are
 * <ul>
 * 	<li>The <code>router</code> to navigate to the Leitstand views and manage the browser history</li>
 *  <li>The <code>Location</code>  to represent the location of a view</li>
 *  <li>The <code>UserContext</code> providing information about the authenticated user, 
 *      its permissions, id token and access token.</li>
 * </ul> 
 *  
 * The core library registers default event handler for the following events:
 * <ul>
 * 	<li><code>ClientUnauthenticated</code>, a custom event fired if an unauthenticated user attempts to access a protected resource and the server responded with <code>401 Unauthorized<code> status.
 *      The core library redirects the user to the login page to prompt for credentials (<code>/ui/login/login.html</code> or the configured OpenID authorization server)</li>
 *  <li><code>ClientForbidden</code>, a custom event fired if an authenticated user attempts to access a resource with insufficient privileges and the server responded with a <code>403 Forbidden</code> status.
 *		The core library redirects the user to a standard error page. (<code>/ui/error/403.html</code>) </li>
 *  <li><code>ResourceNotFound</code>, a custom event fired if the requested resource does not exist and the server responded with a <code>404 Not Found</code> status.
 *      The core library redirecs the user to a standard error page (<code>/ui/error/404.html</code>).
 *  <li><code>InternalServerError</code>, a custom event fired if the server responded with <code>500 Internal Server Error</code> status.
 *      The core library redirects the user to a standard error page (<code>/ui/error/500.html</code>).</li>
 * </ul>
 * @module
 */

/**
 * The <code>UIOpenView</code> event is a custom event to open a view in the Leitstand UI.
 * The event conveys the location of the view and information about the authenticated user.
 * @type {Object}
 * @typedef UIOpenView
 * @property {Location} detail.view view to be opened
 * @property {UserContext} detail.user the authenticated user
 */

/**
 * The Leitstand router maintains the browser history and either opens the requested Leitstand view by means of firing a <code>UIOpenView</code> custom event 
 * or delegates routing back to the browser for all external targets.
 * 
 */
export const router = {
		
		/**
		 * Navigates to the specified target.
		 * Fires a <code>UIOpenView</code> custom event if the target is a Leitstand view.
		 * Delegates routing to the browser for all non Leitstand views.
		 * @param {Location} target the target to be opened
		 * @returns <code>true</code> if the target is a Leitstand view and opened by the router and <code>false</code> for all external targets.
		 */
		navigate : function(target) {
			// Store current view in browser history.
			if(new Location(window.location.href).path != target.path && !(window.event && window.event.type == 'popstate')){
				window.history.pushState({'href':window.location.href},null,target.path);
			}

			if (target.module) {
				// Open the requested view.
				window.dispatchEvent(new CustomEvent('UIOpenView',{detail:{view:target,
																		   user:UserContext.get()}}));
			
				return true;
			}
			// Delegate routing to browser.
			return false;
		},
		
		/**
		 * Redirects the browser to the specified URI bypassing the router logic.
		 * @param {string} target the redirect target
		 */
		redirect : function(target) {
			window.location.href = target;
		},
		
		/**
		 * Walks back the browser history.
		 * Proceeds at the specified default target if the browser history is empty.
		 * Does nothing if the browser history is empty an no default target is specified.
		 * @param {string} defaultTarget the default target if the browser history is empty.
		 */
		back : function(defaultTarget) {
			if (window.history.length > 0) {
				window.history.back();
			} else if(defaultTarget){
				this.redirect(defaultTarget);
			}
		}
	};

/**
 * The user context provides information about the authenticated user, including
 * <ul>
 * 	<li>The user account ID</li>
 *  <li>The user account name, which is used to login</li>
 *  <li>The user first and last name</li>
 *  <li>The scopes the user is allowed to access</li>
 * </ul>
 */
export class UserContext {

	static init(user){
		return new UserContext(user);
	}
	
	/**
	 * Returns the user context of the authenticated user.
	 */
	static get(){
		return new UserContext();
	}
	
	/**
	 * Creates a new user context.
	 * @param user the profile of the authenticated user
	 */
	constructor(user){
		if(user){
			window.sessionStorage.setItem("user",JSON.stringify(user));
			this._user = user;
		} else {
			this._user = JSON.parse(window.sessionStorage.getItem("user"));
			if(this._user == null){
			    window.location.href="/api/v1/logout";
			}
		}
	}
	
	/**
	 * Returns the user account ID
	 * @return the user account ID
	 */
	get userId(){
		return this._user.user_id;
	}
	
	/**
	 * Returns the user account name.
	 * @return the user account name.
	 */
	get userName(){
		return this._user.user_name;
	}
	
	/**
	 * Returns the first name of the user.
	 * @return the first name of the user.
	 */
	get firstName(){
		return this._user.first_name;
	}
	
	/**
	 * Returns the last name of the user.
	 * @return the last name of the user.
	 */
	get lastName(){
		return this._user.last_name;
	}
	
	/**
	 * Returns the name of the user formed by first name followed by last name.
	 * @return the name of the user
	 */
	get name(){
		const first = this.firstName;
		const last = this.lastName;
		if(first && last){
			return `${first} ${last}`;
		}
		return null;
	}
	
	/**
	 * Returns the scopes the user can access.
	 * @return {String[]} the accessible scopes as array of strings
	 */
	get scopes(){
		return [...this._user.scopes];
	}
	
	/**
	 * Checks whether the user has one of the specified scopes.
	 * @param {...String|String[]} scopes the scopes to be tested
	 * @return <code>true</code> if the user is in at least on of the specified roles, <code>false</code> otherwise.
	 */
	scopesIncludeOneOf(scopes){
		if(this._user == null){
			return false;
		}
		if(Array.isArray(scopes)){
			if(scopes.length == 0){
				// Every authenticated user satisfies the constraint to have no scope assigned.
				return true;
			}
			// Check is user can access on of the specified scopes
			for(let i=0; i < scopes.length; i++){
				if(this._user.scopes.includes(scopes[i])){
					return true;
				}
			}
			return false;
		}
		// Iterate over all passed scopes.
		for(let i=0; i < arguments.length; i++){
			const scope = arguments[i];
			if(this._user.scopes.includes(scope)){
				return true;
			}
		}
		return arguments.length == 0;
	}
}

/**
 * The location of a Leitstand view.
 * <p>
 * The Leitstand view location path consists of 
 * <ol>
 * <li>the <code>ui/views</code> literal followed by </li>                                                                        
 * <li>the module name followed by</li>                                                                                                                           
 * <li>an optional sub module folder followed by</li>                                                                                                     
 * <li>the view template file name followed by<li>                                                                                                                             
 * <li>optional query parameters.</li>
 * </ol>                                                                                                              
 * The <code>/</code> character is the delimiter of location path segments.                                                                                  
 * The <code>?</code> character is the delimiter of the path section and the query parameters.
 * The <code>&<code> character is the query parameters delimiter.                                                                
 * Each query parameter is a key-value pair using the <code>=</code> as delimiter between key and value.                                                   
 * <p>                                                                                                                                                     
 * Location also supports anchors to identify a certain section of a view.  
 * The anchor is inserted between the view template and the query parameters section 
 * using the <code>#</code> as delimiter of the view template file name and the section identifier.      
 * For example, location <code>/ui/views/inventory/topology/link-state.html?group=INN</code> refers to the <em>link-state.html</em> view 
 * of the <em>topology</em> application located in the <em>inventory</em> module. 
 * The <code>group</code> query parameter specifies the group of which the link-state graph should be displayed.
 */
export class Location {
	

	/* Regular expression to retrieve the module, the application, the view and the path from an arbitrary absolute or relative URL
	 * 	Group 1: the entire path
	 * 	Group 2: the module
	 * 	Group 3: the application
	 * 	Group 4: the view.
	 * Example: http://dev.rtbrick.com/ui/views/inventory/app/images/images.html?id=12
	 * 	Group 1: /ui/views/inventory/app/images/images.html
	 * 	Group 2: inventory
	 * 	Group 3: app/images
	 * 	Group 4: images.html
	 * Use regexr.com for detailed analysis.
	 */
	static get PATTERN(){
		return /(?:https?:\/\/[\w\.]+(?::\d+)?)?((?:\/\w+\/\w+)\/([\w-]+)\/?((?:\/)?[\w-]+)?\/([\w-]+\.html).*)/;
	}
	
	/**
	 * Translates a path descriptor to a URI string.
	 * @static
	 * @param {PathDescriptor|string} pd the path descriptor or the URI as string
	 */
	static href(pd) {
		if(pd.view){
			if (pd['?']) {
				let del = '?';
				let queryString = '';
				for (let param in pd['?']) {
					const value = pd['?'][param];
					if(value || value === false){
						if(Array.isArray(value)){
							// Multi value
							value.forEach((item) => {
								queryString += `${del}${param}=${encodeURIComponent(item)}`;
								del = '&'; // Use & as delimiter for all parameters after the first parameter
							});
							continue; // with next query parameter
						} 
						queryString += `${del}${param}=${encodeURIComponent(value)}`;
						del = '&'; // Use & as delimiter for all parameters after the first parameter
					}
				}
				return pd.view + queryString;
			}
			return pd.view;
		}
		return pd;
	}
	
	/**
	 * Creates a <code>Location.</code>
	 * @param {string|PathDescriptor} href the link reference
	 */
	constructor(href){
		this._href = href;
		this._groups = Location.PATTERN.exec(href);
		if(!this._groups){
			//Create empty group in case that href does not match the PATTERN, i.e. for external links.
			this._groups=[];
		}
		this._params = null;
	}

	/**
	 * Returns whether the link is an <em>external</em> link, 
	 * i.e. a link to a resource that is not part of this UI.
	 * @returns {boolean} <code>true</code> if this link is an external link, <code>false</code> if not.
	 */
	isExternal() {
		return this._href.indexOf('http') == 0
				&& this._href.indexOf(`${window.location.protocol}//${window.location.host}`) != 0;
	}
	
	/**
	 * Returns whether the link is a <em>local</em> link, 
	 * i.e. a link that refers to an anchor on the current view.
	 * @returns {boolean} <code>true</code> if this link is a local link, <code>false</code> if not
	 */
	isLocal() {
		const hash = window.location.href.indexOf('#');
		if (hash >= 0) {
			return this._href.indexOf(window.location.href.substring(0, hash)) == 0;
		}
		return this._href == window.location.href;
	}
	
	/**
	 * Returns the path to the view. 
	 * The path section starts with the first <code>/</code> after the host and also includes query parameters,
	 * if query parameters are specified.
	 * @returns {string} the path section of the string including query parameters.
	 * @readonly
	 */
	get path() {
		return this._groups[1];
	}
	
	/**
	 * Returns the module-scoped path of the view. 
	 * The view name starts after the module identifier and ends either at 
	 * the first occurrence of a <code>#<code> character, i.e. the beginning of an anchor section, or at
	 * the first occurrence of a <code>?</code> character, i.e. the beginning of the query parameters section, or at 
	 * the end of the string if neither an anchor nor query parameter sections exists.
	 * @returns {string} the unique view name
	 * @readonly
	 */
	get view() {
		if(this._groups[3]){
			return `${this._groups[3]}/${this._groups[4]}`;
		}
		return this._groups[4];
	}
	
	/**
	 * Returns the query string.
	 * @return the query string or an empty string if no query string is present
 	 * @readonly
	 */
	get queryString(){
		const qm = this._href.lastIndexOf('?');
		if(qm < 0){
			return '';
		}
		return this._href.substring(qm);
	}
	
	/**
	 * Returns the module name. 
	 * The module name is the first path segment after the context root segment.
	 * @return {string} the module name
 	 * @readonly
	 */
	get module(){
		return this._groups[2];
	}
	
	/**
	 * Returns the application identifier. 
	 * The application identifier is constituted by all path segments after the module path segment.
	 * @return {string} the application identifier
 	 * @readonly
	 */
	get app(){
		return this._groups[3];
	}
	
	/**
	 * Returns the query parameter value or <code>null</code> if the parameter does not exist.
	 * @param {string} the parameter name
	 * @returns {string} the parameter value or <code>null</code> if the parameter is not set
	 */
	param(name) {
		return this.params[name];
	}

	/**
	 * Returns all query parameters as associative array.
	 * Returns an empty object if no parameters exist.
	 * @return {object} an associative array of all existing parameters.
 	 * @readonly
	 */
	get params(){
		if (this._params == null) {
			this._params = {};
			let qm = this._href.lastIndexOf('?');
			if (qm > 0) {
				const pairs = this._href.substring(qm + 1).split('&');
				for (let i = 0; i < pairs.length; i++) {
					const keyvalue = pairs[i].split('=');
					if(!this._params[keyvalue[0]]){
						this._params[keyvalue[0]] = decodeURIComponent(keyvalue[1]);
						continue;
					}
					const multivalue = this._params[keyvalue[0]];
					if(Array.isArray(multivalue)){
						multivalue.push( decodeURIComponent(keyvalue[1]));
						continue;
					}
					this._params[keyvalue[0]]=[multivalue,
										  	   decodeURIComponent(keyvalue[1])];
				}
			}
		}
		return this._params;
	}
		
}

Location.prototype.toString = function(){
	return this._href;
}

window.addEventListener("popstate", function(event) {
	if (event.state && event.state.href) {
		router.navigate(new Location(window.location.href));
	} 
}, true);

window.addEventListener('ClientUnauthenticated',function(){
	router.redirect('/ui/login/login.html');
});

window.addEventListener('ClientForbidden',function(event){
	router.redirect('/ui/error/403.html');
});

window.addEventListener('ResourceNotFound',function(){
	router.redirect('/ui/error/404.html');
});

window.addEventListener('InternalServerError',function(){
	router.redirect('/ui/error/500.html');
});

/**
 * Intercepts all clicks on links to send them to the router.
 * Stops event processing if router is able to open the specified target.
 * Delegate event processing to the browser if the router is not able to navigate to the specified target.
 */
const onclick = function(event) {
	if(event.target.href && router.navigate(new Location(event.target.href))){
		// Stop event processing because router has opened the specified target.
		event.stopPropagation();
		event.preventDefault();
	}
};
document.addEventListener("click", onclick);


