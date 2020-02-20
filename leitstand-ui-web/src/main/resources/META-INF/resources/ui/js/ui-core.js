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
import {Json} from './client.js';
import {Modules} from './ui-modules.js';

/**
 * <h2>UI Core</h2>
 * This library contains the UI module management.
 * It loads the main menu and module descriptors from the UI servers,
 * maintains the Leitstand navigation and 
 * loads the view templates, controllers and client libraries forming the module applications.
 * @module
 */

/**
 * Leitstand UI module descriptor.
 * <p>
 * The descriptor describes the module application and the module menus.
 * @type {Object}
 * @typedef ModuleDescriptor
 * @property {String} module the module name
 * @property {ModuleApplication} applications[] the module applications
 * @property {ModuleMenu} navigation[] the module menus
 */

/**
 * Leitstand UI module application descriptor.
 * <p>
 * Sets the application controller file name and whether to load the application at the time when the module is loaded (default) or only on demand.
 * @type {Object}
 * @typedef ModuleApplication
 * @property {String} application the application name
 * @property {String} [controller='controller.js'] the application controller file name
 * @property {boolean} [defer=false] whether to defer loading the application
 */

/**
 * Leitstand UI module menu descriptor.
 * <p>
 * Describes a single menu of a Leitstand module.
 * @type {Object}
 * @typedef ModuleMenu
 * @property {String} menu the menu name
 * @property {String  label the menu label
 * @property {String} [title] the menu title
 * @property {MenuItem} items the menu items
 */

/**
 * Leitstand view model property matcher settings.
 * <p>
 * A view model property matcher validates whether a view model property satisfies one out of the following constraints:
 * <ul>
 * <li>The <em>EXISTS</em> constraint expects the view model property to be set. 
 *     <code>0</code>, <code>false</code>,<code>null</code> and empty string (<code>""</code>) are consider as unset properties</li>
 * <li>The <em>EXISTS NOT</em> constraint expects the view model property to be <em>not</em> set. 
 *     <code>0</code>, <code>false</code>,<code>null</code> and empty string (<code>""</code>) are consider as unset properties.
 *     A property is also not set if the property is <code>undefined</code>.</li> 
 * <li>The <em>MATCHES</em> constraint expects the view model property to match a regular expression.
 *     The <em>MATCHES</em> constraint is only applicable for string properties and returns <code>false</code> for all non-string properties</li>
 * <li>The <em>MATCHES NOT</em> constraint expects the view model property to <em>not</em> match a regular expression.
 *     The <em>MATCHES NOT</em> constraint is only applicable for string properties and returns <code>true</code> for all non-string properties</li>
 * </ul>
 * @type {Object}
 * @typedef ViewModelPropertyMatcherSettings
 * @property {String} property the property name
 * @property {boolean} [exists] <code>true</code> if the property must be present (<em>EXISTS</em> constraint) or <code>false</code> if the property must not be present (<em>EXISTS NOT</em> constraint).
 * @property {String} [matches] a regular expression the property must match (<em>MATCHES</em> constraint)
 * @property {String} [matches_not] a regular expression the property must not match (<em>MATCHES_NOT</em> constraint)
 */

/**
 * Container for all Leitstand UI modules.
 */
export const modules = {};

/**
 * A simple router to navigate from the current view to 
 * another view or to walk back the browser history to 
 * previous views.
 */
export const router = {
		/**
		 * Navigates to the specified view. 
		 * @returns <code>true</code> if the router was able to navigate to the requested view,
		 * returns <code>false</code> if not. In the latter case routing is delegated to the browser.
		 * @param {Location} link the view location
		 */
		navigate : function(link) {
			// Store current view in browser history.
			if(new Location(window.location.href).path() != link.path() && window.event.type != "popstate"){
				window.history.pushState({"href":window.location.href},null,link.path());
			}
			
			let moduleName = link.module();
			
			if (!moduleName) {
				return false;
			}
			
			let module = modules[link.module()];
			if (!module) {
				let loader = new ModuleLoader();
				loader.load(link);
				return true;
			}
			
			// Update main menu
			if(Modules.select(link.module())){
				window.dispatchEvent(new CustomEvent('UIOpenModule',
													{'detail':{'location':link,
															   'module':link.module(),
															   'app':link.app(),
															   'view':link.view()}}));
			};

			// Notify module to open the selected view.
			window.dispatchEvent(new CustomEvent('UIOpenView',
												{'detail':{'location':link,
														   'module':link.module(),
														   'app':link.app(),
														   'view':link.view()}}));
			return true;
		},
		
		/**
		 * Redirects the browser to the specified URI bypassing the router logic.
		 * @param {string} path the redirect target
		 */
		redirect : function(path) {
			window.location.href = path;
		},
		
		/**
		 * Walks back the browser history.
		 * @param {string} defaultPath the view to display if the browser history is empty
		 */
		back : function(defaultPath) {
			if (window.history.length > 0) {
				window.history.back();
			} else {
				this.redirect(defaultPath);
			}
		}
	};

//Listen to browser back and navigate to the proper view.
//Since the top-level menu (i.e. the tabs) handles all browser back operations,
//walking back over module boundaries is supported. The tabs menu puts the focus
//on the current module and then calls the router to display the proper view.
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
 * The user context provides information about the authenticated user.
 */
export class UserContext {

	static init(user){
		new UserContext(user);
	}
	
	/**
	 * Returns a user context for the authenticated user.
	 */
	static get(){
		return new UserContext();
	}
	
	/**
	 * Creates a new user context.
	 * @param user the settings of the authenticated user
	 */
	constructor(user){
		if(user){
			window.sessionStorage.setItem("user",JSON.stringify(user));
			this.user = user;
		} else {
			this.user = JSON.parse(window.sessionStorage.getItem("user"));
		}
	}
	
	/**
	 * Returns the user account ID
	 * @return the user account ID
	 */
	get userId(){
		return this.user.user_id;
	}
	
	/**
	 * Returns the user account name.
	 * @return the user account name.
	 */
	get userName(){
		return this.user.user_name;
	}
	
	/**
	 * Returns the first name of the user.
	 * @return the first name of the user.
	 */
	get firstName(){
		return this.user.first_name;
	}
	
	/**
	 * Returns the last name of the user.
	 * @return the last name of the user.
	 */
	get lastName(){
		return this.user.last_name;
	}
	
	/**
	 * Returns the name of the user formed by first name followed by last name.
	 * @return the name of the user
	 */
	get name(){
		let first = this.firstName;
		let last = this.lastName;
		if(first && last){
			return first+" "+last;
		}
		return null;
	}
	
	/**
	 * Returns the scopes the user can access.
	 * @return {String[]} the accessible scopes as array of strings
	 */
	get scopes(){
		return [...this.user.scopes];
	}
	
	/**
	 * Checks whether the user has one of the specified roles.
	 * @param {String|String[]} role the expected role or an array of expected roles
	 * @return <code>true</code> if the user is in at least on of the specified roles, <code>false</code> otherwise.
	 */
	scopesIncludeOneOf(scope){
		if(this.user == null){
			return false;
		}
		if(Array.isArray(scope)){
			if(scope.length == 0){
				// Every authenticated user satisfies the constraint to have no scope assigned.
				return true;
			}
			// Check is user can access on of the specified scopes
			for(let i=0; i < scope.length; i++){
				if(this.user.scopes.includes(scope[i])){
					return true;
				}
			}
			return false;
		}
		if(scope){
			// Check if user can access the specified scope
			return this.user.scopes.includes(scope);
		}
		return false;
	}
}

/**
 * The location of a view template.
 * <p>
 * Every Leitstand view template locations consists of 
 * <ul>
 * <li>the <code>ui</code> literal followed by </li>                                                                        
 * <li>the module name followed by</li>                                                                                                                           
 * <li>an optional module application name followed by</li>                                                                                                     
 * <li>the view template name followed by<li>                                                                                                                             
 * <li>optional query parameters.</li>
 * </ul>                                                                                                              
 * The <code>/</code> (slash) is the delimiter between the location path segments.                                                                                  
 * The <code>?</code> is the delimiter between the path section and the  query parameters.                                                                 
 * Each query parameter is a key-value pair using the <code>=</code> as delimiter between key and value.                                                   
 * The first parameter follows immediately the <code>?</code> while further parameters are appended with the <code>&</code> (ampersand) as delimiter.      
 * <p>                                                                                                                                                     
 * Location also supports anchors.                                                                                                                         
 * An anchor identifies a certain section within a view.                                                                                                   
 * The name of the anchor is appended to the view template name using an <code>#</code> (hash) as delimiter.                                                        
 * The anchor is inserted between the view template and the query parameters section.      
 * <p>
 * For example, location <code>/ui/views/inventory/topology/link-state.html?group=INN</code> refers to the <em>link-state.html</em> view template
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
			var view = pd.view;
			if (pd['?']) {
				var del = '?';
				var query = '';
				for ( var p in pd['?']) {
					var v = pd['?'][p];
					if(v || v === false){
						if(v.forEach){
							// Multi value
							v.forEach(function(item){
								query += (del + p + '=' + encodeURIComponent(item));
								del = '&';
							});
							continue; //with next parameter
						} 
						query += (del + p + '=' + encodeURIComponent(v));
						del = '&';
					}
				}
				return view + query;
			}
			return view;
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
		var hash = window.location.href.indexOf('#');
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
	 */
	path() {
		return this._groups[1];
	}
	
	/**
	 * Returns the module-scoped path of the view. 
	 * The view name starts after the module identifier and ends either at 
	 * the first occurrence of a <code>#<code> character, i.e. the beginning of an anchor section, or at
	 * the first occurrence of a <code>?</code> character, i.e. the beginning of the query parameters section, or at 
	 * the end of the string if neither an anchor nor query parameter sections exists.
	 * @returns {string} the unique view name
	 */
	view() {
		if(this._groups[3]){
			return `${this._groups[3]}/${this._groups[4]}`;
		}
		return this._groups[4];
	}
	
	/**
	 * Returns the query string.
	 * @return the quest string or an empty string if no query string is present
	 */
	queryString(){
		let qm = this._href.lastIndexOf("?");
		if(qm < 0){
			return "";
		}
		return this._href.substring(qm);
	}
	
	/**
	 * Returns the module name. 
	 * The module name is the first path segment after the context root segment.
	 * @return {string} the module name
	 */
	module() {
		return this._groups[2];
	}
	
	/**
	 * Returns the application identifier. 
	 * The application identifier is constituted by all path segments after the module path segment.
	 * @return {string} the application identifier
	 */
	app(){
		return this._groups[3];
	}
	
	/**
	 * Returns the query parameter value or <code>null</code> if the parameter does not exist.
	 * @param {string} the parameter name
	 * @returns {string} the parameter value or <code>null</code> if the parameter is not set
	 */
	param(name) {
		return this.params()[name];
	}

	/**
	 * Returns all query parameters as associative array.
	 * Returns an empty object if no parameters exist.
	 * @return {object} an associative array of all existing parameters.
	 */
	params() {
		if (this._params == null) {
			this._params = {};
			let qm = this._href.lastIndexOf('?');
			if (qm > 0) {
				let pairs = this._href.substring(qm + 1).split('&');
				for (let i = 0; i < pairs.length; i++) {
					let keyvalue = pairs[i].split('=');
					if(!this._params[keyvalue[0]]){
						this._params[keyvalue[0]] = decodeURIComponent(keyvalue[1]);
						continue;
					}
					let multivalue = this._params[keyvalue[0]];
					if(typeof multivalue === 'array'){
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

/**
 * Intercepts all clicks on links to send them to the router and 
 * forwards the event to the browser default if the router cannot approach the link target.
 */
let onclick = function(event) {

	if(event.target.href && router.navigate(new Location(event.target.href))){
		event.stopPropagation();
		event.preventDefault();
	}
};
document.addEventListener("click", onclick);

/**
 * View model property matcher.
 * <p>
 * A <code>ViewModelPropertyMatcher</code> verifies whether a view model property satisfies a certain constraint.
 * The following constraints exists:
 * <ul>
 * <li>The <em>EXISTS</em> constraint expects the view model property to be set. 
 *     <code>0</code>, <code>false</code>,<code>null</code> and empty string (<code>""</code>) are consider as unset properties</li>
 * <li>The <em>EXISTS NOT</em> constraint expects the view model property to be <em>not</em> set. 
 *     <code>0</code>, <code>false</code>,<code>null</code> and empty string (<code>""</code>) are consider as unset properties.
 *     A property is also not set if the property is <code>undefined</code>.</li> 
 * <li>The <em>MATCHES</em> constraint expects the view model property to match a regular expression.
 *     The <em>MATCHES</em> constraint is only applicable for string properties and returns <code>false</code> for all non-string properties</li>
 * <li>The <em>MATCHES NOT</em> constraint expects the view model property to <em>not</em> match a regular expression.
 *     The <em>MATCHES NOT</em> constraint is only applicable for string properties and returns <code>true</code> for all non-string properties</li>
 * </ul>
 */
class ViewModelPropertyMatcher{
	
	/**
	 * Creates a <code>ViewModelPropertyMatcher</code>.
	 * @param {ViewModelPropertyMatcherSettings} matcher the matcher settings
	 */
	constructor(matcher){
		this.matcher = matcher;
	}
	
	/**
	 * Tests whether the view model satisfies the constraints defined by this matcher.
	 * @param viewModel the current view model as JSON object
	 * @return <code>true</code> if the view model satisfies the matcher constraint, <code>false</code> otherwise.
	 */
	accepts(viewModel){
		let property = this.matcher.property;
		let value = viewModel[property];
		if(this.matcher.exists === true){
			return !!viewModel;
		}
		if(this.matcher.exists === false){
			return !viewModel;
		}
		if(this.matcher.matches){
			return value && value.matches && value.matches(this.matcher.matches); 
		}
		if(this.matcher.matches_not){
			return !value || !value.matches || !value.matches(this.matcher.matches_not);
		}
		
		// A matcher without any settings accepts everything.
		return true;
	}
	
}

/**
 * Leitstand UI module loader.
 * <p>
 * The Leitstand UI consists of modules.
 */
class ModuleLoader {
	
	/**
	 * Loads the module d
	 */
	async load(link){
		if(!link){
			link = new Location(window.location.href);
		}
		
		// Load all missing javascript libraries.
		let moduleLoader = new Json(`/api/v1/ui/modules/${link.module()}`);
		this._descriptor = await moduleLoader.load();
		modules[this.name] = this;
		window.dispatchEvent(new CustomEvent('UIModuleLoaded',{'detail':{'module':this._descriptor,
																		 'location':link}}));
	};
	
	get name(){
		return this._descriptor.module;
	}
	/**
	 * Computes the menu view model.
	 * @param model the JSON data returned by the REST API.
	 * @returns {Object} the menu view model.
	 */
	computeMenuViewModel(model){
		// Apply the model to the navigation template to create the navigation view.
		// Create a string representation from the JSON descriptor
		
		if(this._descriptor.navigation){
			let location = new Location(window.location.href);
			// Render the menu itmes from the module descriptor navigation template
			let menus = JSON.parse(Mustache.render(JSON.stringify(this._descriptor.navigation),merge(location,model)));
			// The menu view model consists of
			// - the menus, i.e. all menus of all applications of the current module
			// - the model, i.e. the data being displayed in the current view
			// - the enabled decorator that decides whether a certain menu is enabler
			// - the viewpath decorator that computes the path of a certain view.
			let menuViewModel = merge({'menus':menus},
								       model);

			// Load all roles the user has.
			let user = UserContext.get();

			// Add enabled decorator
			menuViewModel.enabled = function(){
				let scopesAllowed = this.scopes_allowed;
				if(scopesAllowed && !user.scopesIncludeOneOf(scopesAllowed)){
					// Menu is not enabled because user has no access to any of the allowed scopes
					return false;
				}
				
				// Check that all required properties exist
				for (let i=0; i < this.requires.length; i++){
					if(!!model[this.requires[i]]){
						continue;
					}
					if(!!this.query[this.requires[i]]){
						continue;
					}
					return false;
				}
				
				// Check that every view model property matcher is satisfied
				for(let i=0; i < this.view_model.length; i++){
					let matcher  = new ViewModelPropertyMatcher(this.view_model[i]);
					if(matcher.accepts(viewModel)){
						continue;
					}
					return false;
				}
				
				return true;
			};
			// Add viewpath decorator
			let moduleName = this._descriptor.module;
			menuViewModel.viewpath = function(){
				let query = '';
				let delimiter = '?';
				for (let p in this.query){
					query += delimiter+p+'='+this.query[p];
					delimiter='&';
				}
				
				return `/ui/views/${moduleName}/${this.view}${query}`;
			};
			return menuViewModel;
		}
		return {};// Empty view model.
	}
}

