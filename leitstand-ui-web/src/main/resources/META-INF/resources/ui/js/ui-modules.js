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
import {Resource,Json,merge} from './client.js';
import {router,Location,UserContext} from './ui-core.js';
import {JSONPath} from './ext/jsonpath-plus.min.js';

// Leitstand modules
const modules = {};

/**
 * Leitstand UI module descriptor.
 * <p>
 * The descriptor describes the module application and the module menus.
 * @type {Object}
 * @typedef ModuleDescriptor
 * @property {String} module the module name
 * @property {ModuleApplication} applications[] the module applications
 * @property {ModuleMenu} menus[] the module menus
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
 * @property {String} category the menu category
 * @property {String} label the menu label
 * @property {String} [title] optional menu title
 * @property {String} [requires[]]} optional array of view model properties that must be present to enable this menu
 * @property {ViewModelMatcherSettings} [view_model[]] optional set of view model property matchers that must be satisfied to enable this menu
 * @property {Object} query optional set of query parameters that shall be appended to the query string of all views referenced by this menu
 * @property {String} [scopes_allowed[]] optional array of scopes that are allowed to access this menu
 * @property {MenuItem} items the menu items
 */

/**
 * Leitstand UI module menu item descriptor.
 * <p>
 * Describes a menu item of a Leitstand module menu.
 * @type {Object}
 * @typedef ModuleMenu
 * @property {String} item the item name
 * @property {String} category the item category
 * @property {String} label the item label
 * @property {String} view the view template location
 * @property {String} [title] optional item title
 * @property {String} [requires[]]} optional array of view model properties that must be present to enable this menu item
 * @property {ViewModelMatcherSettings} [view_model[]] optional set of view model property matchers that must be satisfied to enable this menu item
 * @property {Object} query optional set of query parameters that shall be appended to the query string of the view location
 * @property {String} [scopes_allowed[]] optional array of scopes that are allowed to access this menu item
 * @property {Object} [config] optional view configuration that is passed to the opened view.
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
 * Modules provides access to all UI modules.
 */
export class Modules {
	
	/**
	 * Selects the UI module with the specified name and updates the main menu accordingly.
	 * Loads the UI module if the module has not yet been loaded into the browser.
	 * @return {Promise} a promise that resolves the UI module
	 * @see Module
	 */
	static selectModule(name){
		const module = modules[name];
		const mainMenu = document.querySelector('ui-modules');
		if (module) {
			if(mainMenu.select(name)){
				// Update module template if a different module was selected.
				mainMenu.openModule(module)
			}
			// Return the cached module
			return Promise.resolve(module);
		}

		// Load the module descriptor
		// then create a module object
		// then load all dependencies
		// then cache the initialized module
		// then return the initialized module
		const loader = new Json(`/api/v1/ui/modules/${name}`);
		return loader.load()
		             .then((descriptor) => { return new Module(descriptor)})
		             .then((module) => {
		            	 return module.load()
		            	              .then((module) => {
		            	            	  // Cache the initialized module	
		            	            	  modules[name] = module;
		            	            	  mainMenu.select(name);
		            	            	  mainMenu.openModule(module);
		            	            	  return Promise.resolve(module);
		            	              	});
		             })
		             .catch((e) => alert(e));
					  
		
	}
	
	/**
	 * Returns the module with the specified name.
	 * Returns <code>null</code> if the module does not exist.
	 * @return the UI module or <code>null</code> if the module does not exist.
	 * @see Module
	 */
	static getModule(name){
		return modules[name];
	}
	

	
}

window.addEventListener('UIOpenView',evt => {
	// Select the module of the current view
	Modules.selectModule(evt.detail.view.module)
		   .then((module) => module.openView(evt.detail.view));
});

/**
 * A HTML resource.
 * @extends Resource
 */
class Html extends Resource {
	
	/**
	 * Creates a HTML resource.
	 * @path {string} uri the URI template of the HTML resource
	 * @path {object} params the optional arguments for the URI template
	 */
	constructor(uri,params){
		super();
		this._uri = uri;
		this._params = params;
	}
	
	/**
	 * Loads the HTML resource from the server.
	 */
	load() {
		return this.html(this._uri,
						 this._params)
				   .GET();
	}
}

/**
 * The view descriptor provides access to the settings needed to initialize a view.
 */
class ViewDescriptor {
	
	/**
	 * Creates a view descriptor.
	 * @param {MenuItem} view the menu item to open this view
	 */
	constructor(view){
		this._view = view.view;
		// Create copies to prevent modifications from being written to the main menu
		// Looking forward to wider # support :)
		this._scopesAllowed = view.scopes_allowed ? [...view.scopes_allowed] : [];
		this._config = view.config ? {...view.config} : {};
		this._category = view.category;
	}
	
	/**
	 * The view template location.
	 */
	get path(){
		return this._view;
	}
	
	/**
	 * The scopes allowed to access this view.
	 */
	get scopesAllowed(){
		return this._scopesAllowed;
	}
	
	/**
	 * Tests whether the specified scope is allowed to access this view.
	 * @param {String|String[]} s the scopes to be tested
	 * @return {boolean} <code>true</code> when at least one of the specified scopes can access this view, <code>false</code> otherwise.
	 */
	isScopeAllowed(s){
		if(!this._scopesAllowed || this._scolesAllowed.length == 0){
			return true;
		}
		// Check if any of the specified scope is allowed to access this view
		if(Array.isArray(s)){
			for(let i=0; i < s.length; i++){
				if(this._scopesAllowed.includes(s[i])){
					return true;
				}
			}
			return false;
		}
		// Check if specified scope is allowed to access this view
		return this._scopesAllowed.includes(s);
	}

	/**
	 * The view category.
	 * The category is used to group views by implementation characteristics.
	 */
	get category(){
		return this._category;
	}
	
	/**
	 * The view configuration.
	 */
	get config(){
		// Return a copy of the config to prevent modifications from being reflected to this descriptor
		return this._config;
	}
	
}


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
		const property = this.matcher.property;
		const value = viewModel[property];
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
 * Leitstand UI module.
 * <p>
 * The Leitstand UI consists of modules.
 * Each module can be divided into <em>applications</em>, which are shipped with the module.
 * The resources of an application are located in a sub-folder of the module root folder.
 * The folder name is also the application name.
 * The module root folder contains the default application which typically provides the module welcome view.
 */
export class Module {
	
	/**
	 * Creates a new module descriptor.
	 * @param {ModuleDescriptor} descriptor the module descriptor
	 */
	constructor(descriptor){
		this._descriptor = descriptor;
		if(!this._descriptor.controller){
			this._descriptor.controller = 'controller.js';
		}
		if(!this._descriptor.template){
			this._descriptor.template = 'template.html';
		}
	}

	/**
	 * Loads the module and all dependent applications.
	 */
	async load(location){
		if(!location){
			location = new Location(window.location.href);
		}
		
		// Load all missing javascript libraries.
		try{
			// Load the module controller
			const moduleController = await import(`/ui/modules/${location.module}/${this._descriptor.controller||'controller.js'}`);
			this._menu = moduleController.menu;
			// Load all application controllers.
			if(module.applications && module.applications.length > 0){
				const applications = await Promise.all(module.applications
															 .filter(app => !app.defer)
															 .map((app) => import(`/ui/modules/${location.module}/${app.controller||`${app.name}/controller.js`}`)
												  						   .then((lib) => { return {app:app,controller:controller}}))
												  						   .catch((e) => console.log(`Attempt to load application ${location.app} of module ${location.module} failed with ${e}`)));	
				// Merge all applications into the main menu
				applications.forEach((app) => {
					if(app && app.controller.menu){
						this._menu.merge(app.controller.menu,app.app);
					}
				});
			}
			const templateLoader = new Html(`/ui/modules/${this._descriptor.module}/${this._descriptor.template}`);
			this._moduleTemplate = await templateLoader.load();
			return this;
		} catch (e){
			console.error(`Failed to initialze module ${location.module}. Reported error: ${e}`);
			throw e;
		}
		
	};
	
	// Lazy load application
	loadApplication(location){
		let app = this._descriptor.applications && this._descriptor.applications.find((app) => app.application==location.app);
		if(!app){
			app = {application:location.app};
		}
		if(!app.controller){
			app.controller = `${location.app}/controller.js`;
		}
		
		return import(`/ui/modules/${location.module}/${app.controller}`)
			   .then(controller => {
				   if(controller.menu){
					   this._menu.merge(controller.menu,app);
				   }
				   return this.getController(location);
			   })
			   .catch(e => console.error(`Cannot load library /ui/modules/${location.module}/${app.controller}. Error: ${e}`));
	}
	
	/**
	 * Returns the view controller for the specified view or <code>null</code> if the view does not exist.
	 * @param {Location} view the module-scoped view location
	 * @returns {Controller} the view controller
	 */
	getController(location){
		return this._menu._views[location.view];
	}
	
	/**
	 * Returns the module name.
	 * @returns {string} the module name.
	 */
	get name(){
		return this._descriptor.module;
	}
	
	/**
	 * Selects the specified view in the module menu.
	 * @param location the view location
	 */
	select(location){
		this._menu.select(location);
	}
	
	/**
	 * Opens the specified view.
	 * @param {Location} location the view location
	 */
	openView(location){
		const view = this.getController(location);
		
		if(view){
			this.select(location);
			if(!view.viewTemplate){
		    	const template = new Html(`/ui/modules/${location.module}/${location.view}`);
		    	return template.load()
						   	   .then(template => {
						   		   	 	view.viewTemplate = template;
						   		   	 	return view.load();
						   	   		});
			}
			return view.load();
		}
		// Lazy load view
		this.loadApplication(location)
		    .then(view => {
		    	const template = new Html(`/ui/modules/${location.module}/${location.view}`);
		    	return template.load()
						   	   .then(template => {
						   		   		this.select(location);
						   		   	 	view.viewTemplate = template;
						   		   	 	return view.load();
						   	   		});
		})
		.catch(e => {
			console.debug(`Cannot open view ${location.view} in application ${location.app} of module ${location.module}. Reason: ${e}`);
		});
		
	}
	
	/**
	 * Tests whether the requested view exists.
	 * @param location the view location
	 * @return a promise that gets resolved when the view exists.
	 */
	viewExists(location) {
		return new Promise((resolved,rejected) => {
			const view = this.getController(location);
			if(view){
				resolved(location);
				return;
			}
			// View does not exist. Try to load the view!
			// Lazy load view
			this.loadApplication(location)
			    .then(view => {
			    	const template = new Html(`/ui/modules/${location.module}/${location.view}`);
			    	template.onNotFound = function(){
			    		rejected(location);
			    	};
			    	return template.load()
							   	   .then(template => {
							   		   	  	// Cache the template.
							   		   		view.viewTemplate = template;
							   		   		resolved(location);
							   		   	 })
							   		.catch((e) => rejected(location,e));
			    })
			    .catch((e) => rejected(location,e));
						
		});
			
	}
	

	/**
	 * The module template.
	 * @returns {string} the menu template.
	 */
	get template(){
		return this._moduleTemplate;
	}
	
	/**
	 * Rerturns the view descriptor for the specified view.
	 * @param {Location} the view location.
	 * @return the view descriptor
	 * @see ViewDescriptor
	 */
	describe(location){
		const item = JSONPath(`$..items[?(@.view=="${location.view}")]`,this._descriptor);
		if(item && item.length > 0){
			return new ViewDescriptor(item[0]);
		}
		return null;
	}
	
	/**
	 * Computes the menu view model. 
	 * The menu view model defines defines which menus and menu items are active for the current view being displayed.
	 * @param model view model composed by the current view controller.
	 * @param [filter] an optional filter to compute the view model only for certain menus.
	 * @returns {Object} the menu view model.
	 */
	computeMenuViewModel(model,filter){
		// Apply the model to the navigation template to create the navigation view.
		// Create a string representation from the JSON descriptor
		
		if(this._descriptor.menus){
			const location = new Location(window.location.href);
			const menus = JSON.parse(Mustache.render(JSON.stringify(this._descriptor.menus),merge(location,model)));
			const user = UserContext.get();
			
			// Filter for enabled menus and menu items
			const enabled = function(m){
				const scopesAllowed = m.scopes_allowed;
				if(scopesAllowed && !user.scopesIncludeOneOf(scopesAllowed)){
					// Menu is not enabled because user has none of the required roles
					return false;
				}
				
				if(m.requires){
					// Check that all required properties exist
					for (let i=0; i < m.requires.length; i++){
						if(!!model[m.requires[i]] || JSONPath(m.requires[i],model).length > 0){
							continue;
						}
						if(!!m.query[m.requires[i]]){
							continue;
						}
						return false;
					}
				}
				
				if(m.view_model){
					// Check that every view model property matcher is satisfied
					for(let i=0; i < m.view_model.length; i++){
						const matcher  = new ViewModelPropertyMatcher(m.view_model[i]);
						if(matcher.accepts(model)){
							continue;
						}
						return false;
					}
				}
				return true;
			};

			const moduleName = this._descriptor.module;
			const viewpath = function(item){
				let queryString = '';
				let delimiter = '?';
				for (const p in item.query){
					queryString += delimiter+p+'='+item.query[p];
					delimiter='&';
				}
				
				if(item.view.match(/^(?:[a-z]+\:\/)?\//)){
					return `${item.view}${queryString}`;
				}
				
				return `/ui/views/${moduleName}/${item.view}${queryString}`;
			};

			// Remove all inactive items and compute view path for each active item.
			const enabledMenus = menus.filter(m => !filter || filter(m))
									  .filter(m => enabled(m));

			// Compute view path for all active menu items.
			enabledMenus.forEach((m) => {
				m.items = m.items.filter((item) => enabled(item));
				m.items.forEach((item) => {item.viewpath = viewpath(item)});
			});
			
			return enabledMenus;
			
		}
		// No menus exists
		return [];
	}
	
}

/**
 * Start a timer to periodically refresh the current view if the view controller supplies a <code>refresh</code>callback.
 */
function startAutoRefresh(){
	
	let refresh = function(){
		try{
			const location = new Location(window.location.href);
			const module = Modules.getModule(location.module);
			if(module){
				const controller = module.getController(link);
				if(controller && controller.refresh){
					controller.refresh();
				}
			}
		} catch (e){
			// no action required
		}
	};
	return window.setInterval(refresh,2000);

}

let timer = startAutoRefresh();

window.addEventListener("focus",function(){
	window.clearInterval(timer);
	timer = null;
});

window.addEventListener("blur",function(){
	if(!timer){
		timer = startAutoRefresh();
	}
});
