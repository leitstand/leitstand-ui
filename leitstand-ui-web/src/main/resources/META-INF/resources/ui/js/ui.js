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
 * <h2>UI API</h2>
 * This library contains the User Interface API used by controllers to manage the views.
 * <p>
 * The key elements are <code>Controller</code> and <code>Menu</code>.
 * The controller accesses the REST API, 
 * creates the view model, 
 * invokes the template to render the view and 
 * handles all events that originate from input controls.
 * The <code>Menu</code> connects views to their respective controllers.
 * Every module exports the menu in order to add the module menu to the overall menu.
 * </p>
 * @module
 */

/**
 * The menu configuration is an associative array with the name of the view as key and a {@linkcode Controller}
 * or a {@linkcode MasterDetailPageConfig} as value.
 * @typedef MenuConfig
 * @type {Object}
 * @example <caption>Menu With Master Detail Page</caption>
 * //NOTE: This example does not include the controller factory methods.
 * let masterDetail = {'master':masterPageController(),
 *                     'details':{'detail.html':detailPageController(),
 *                     			 'add.html':addDetailPageController(),
 *                     			 'remove.html:removeDetailPageController()}};
 * // Create the module menus
 * let menu = new Menu({'master.html':masterDetail,
 * 						'other_view.html':otherViewController()})
 * 
 */

/**
 * The path descriptor describes a path to a certain view.
 * @typedef PathDescriptor
 * @type {Object}
 * @property {string} view The path to the view to be displayed
 * @property {Object} [?] The query parameters as associative array.
 * @example <caption>Path Descriptor With Query Parameters</caption>
 * 
 * // Path to element view
 * let path = {'view':'/ui/inventory/elements/element.html',
 * 				'?' : {'group':'INN',
 * 					   'element':'leaf_1.inn'}};
 */

/**
 * The master detail view configuration describes a master view and its detail views.
 * @typedef MasterDetailViewConfig
 * @type {Object}
 * @property {function} master The master view controller .
 * @property {Object} details the detail views as associative array with the view name as key and the controller as value.
 * @example <caption>Menu With Master Detail Page</caption>
 * 
 * // Master page controller factory method.
 * let masterController = function(){
 * 	 return new Controller(...);
 * };
 * // Detail page controller factory method.
 * let detailController = function(){
 *   return new Controller(...);
 * };
 * 
 * // Master detail view with master.html as master page and detail.html as detail page
 * let masterDetailView = {
 *   'master':masterController();
 *   'details':{'detail.html':detailController()}
 * };
 * 
 * // Register master detail page in module menu.
 * let menu = new Menu({'master.html':masterDetailView});
 */

/**
 * The controller configuration tells the <code>Controller</code> which resource to be accessed, 
 * supplies an optional function to translate the resource entity into the view model,
 * renders the view and declares event handlers to handle all events that origin from the view.
 * @typedef ControllerConfig
 * @type {Object}
 * @property {Resource} resource The primary resource displayed on the view
 * @property {function} [viewModel] the <code>viewModel</code> function receives the primary resource as parameter and returns the view model. 
 * 									If unspecified, the resource forms the view model.
 * @property {function} [postRender] invoked after the rendering phase to augment the view with additional data.
 * @property {Object} [buttons] an associative array with the button name as key and the function to handle the button click as value.
 * @property {Object} [selections] an associative array with an exact field name or a field name regular expression as key and 
 * 								   the function that handles a selection change.
 * @property {function} [onLoaded] an event listener function that is called after a successful reload of the primary resource or all other attached resources.
 * @property {function} [onUpdate] an event listener function that is called after a successful update of the primary resource or all other attached resources.
 * @property {function} [onCreated] an event listener function that is called after a successful creation of a new resource.
 * @property {function} [onRemove] an event listener function that is called after a successful removal of the primary resource or any other attached resource.
 * @property {function} [onSuccess] an event listener function that is called after a successful operation if no more-specific listener exists.
 * @property {function} [onNotFound] an event listener function that is called when the requested resource does not exist.
 * @property {function} [onConflict] an event listener function that is called when the request cannot be processed because it conflicts with the server-side resource state.
 * @property {function} [onBadRequest] an event listener function that is called when the request entity cannot be processed.
 * @property {function} [onAccessDenied] an event listener function that is called when the user has insufficient privileges.
 * @property {function} [onUnauthorized] an event listener function that is called when the user is not authorized.
 * @property {function} [onError] an event listener function that is called after a failed operation if no more-specific listener exists. 
 */

import {Resource,Json} from './client.js';
import {Dom,Element} from './ui-dom.js';
import {router,modules,Location} from './ui-core.js';
import {Modules} from './ui-modules.js';




/**
 * The menu binds the views of a module to their respective controllers.
 *  Moreover, the menu sets the welcome page of a module.
 *  <p>
 *  The menu items are passed as {@linkcode MenuConfig} object.
 *  </p>
 * @extends Dom
 */
export class Menu extends Dom {
	
	/**
	 * Creates a new menu.
	 * @param {MenuConfig} menu the menu items
	 * @param {String} welcomePage an absolute path to the welcome page of this module
	 */
	constructor(menu,welcomePage){
		super();
		this._views = {};
		this._items = {};
		for (let path in menu) {
			let view = menu[path];
			this._items[path] = path;
			if (view.master) {
				this._views[path] = view.master;
				if (view.details) {
					for (let subpage in view.details) {
						this._views[subpage] = view.details[subpage];
						this._items[subpage] = path;
					}
				}
				continue;
			}
			this._views[path] = view;
		}
		
		this.getWelcomePage = function(){
			return welcomePage;
		};
	}
	
	/**
	 * Merges the specified menu with this menu. 
	 * Conflicting menu items will be overwritten by the items of the specified menu.
	 * @param {MenuConfig} menu the menu to be merged into this menu
	 * @param {ModuleApplication} [app] optional application descriptor.
	 */
	merge(menu,app){
		let appPath = `${app&&app.application+'/'||''}`;
		for (let view in menu._views){
			this._views[appPath+view] = menu._views[view];
		}
		for (let item in menu._items){
			this._items[appPath+item] = appPath+menu._items[item];
		}
		
	}
	
	
	/**
	 * Returns the page controller for the specified view.
	 * Returns <code>null</code> if the view does not exist.
	 * @param {String} view the module-relative path to the view.
	 * @returns {Controller} the view controller or <code>null</code> if no view controller exists.
	 */
	controller(view) {
		return this._views[view];
	}
	
	/**
	 * Returns the rendered menu item for the specified view or <code>null</code> if the view does not exist.
	 * @return {Element} the menu item DOM element
	 */
	item(view) {
		if(this._items[view]){
			return this.element(this._items[view]);
		}
		return null;
	}
	
	/**
	 * Selects the menu item of a view and returns the controller of this view.
	 * Returns <code>null</code> if the view does not exist.
	 * @param {Location} location the location of the view to be selected
	 * @return {Controller} the controller of the selected view
	 */
	select(location) {
		let selected = document.querySelector("nav[class='menu']>a[class~='selected']");
		if (selected) {
			selected.classList.remove("selected");
		}
		let controller = this.controller(location.view());
		let element = this.item(location.view());
		if (element) {
			element.css().add("selected");
		}
		return controller;
	}

}

/**
 * The <code>Controller</code> accesses the server-side resource through the REST API, 
 * translates the resource entity into the view model, 
 * renders the view and handles all events that originate from controls of the view.
 * <p>
 * The <code>ControllerConfig</code> programs the controller per view.
 * @extends Dom
 */
export class Controller extends Dom {
	
	/**
	 * Creates a new <code>Controller</code> for a particular view.
	 * @param {ControllerConfig} controllerConfig the controller config
	 */
	constructor(controllerConfig){
		super();
		this._page = controllerConfig;
		this._viewModel = {};
		this._attachEventListener = function(resource) {
			let self = this;
			resource.onInputError = function(messages) {
				clearFlashMessages();
				let global = [];
				if (messages.length) {
					let firstInvalidInput = null;
					for (let i = 0; i < messages.length; i++) {
						let message = messages[i];
						if (message.property) {
							let input = self.elements(`#${message.property}`, message.value);
							if (input.length == 1) {
								displayInputError.call(	self,
														input[0].unwrap(),
														message.severity,
														message.message);
								if (!firstInvalidInput) {
									firstInvalidInput = input[0];
								}
								continue;
							}
						}
						global.push(message);
					}
					if (firstInvalidInput) {
						firstInvalidInput.focus();
					}
					displayFlashMessages.call(self,global);
					return;
				}
			};
			resource.onError = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onError) {
					controllerConfig.onError.call(self, state);
				}
			};
			resource.onConflict = function(state){
				if(state.property){
					resource.onInputError([state]);
					return;
				}
				if(state[0] && state[0].property){
					resource.onInputError(state);
					return;
				}
				resource.onError(state);
			};
			resource.onBadRequest = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onBadRequest) {
					controllerConfig.onBadRequest.call(self, state);
					return;
				}
				if(controllerConfig.onError){
					controllerConfig.onError.call(self,state);
					return;
				}
			};
			resource.onSuccess = function(state) {
				if (this.status == 204) { // No content
					displayFlashMessages.call(self, [ {
						"severity" : "INFO",
						"reason" : "WUI0000I",
						"message" : "All changes applied successfully."
					} ]);
				} else {
					displayFlashMessages.call(self, state);
				}
				if (controllerConfig.onSuccess) {
					controllerConfig.onSuccess.call(self, state);
				}
			};
			resource.onRemoved = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onRemoved) {
					controllerConfig.onRemoved.call(self, state);
					return;
				}
				if (controllerConfig.onSuccess){
					controllerConfig.onSuccess.call(self, state);
					return;
				}
			};
			resource.onLoaded = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onLoaded) {
					controllerConfig.onLoaded.call(self, state);
					return;
				}
				if(controllerConfig.onSuccess){
					controllerConfig.onSuccess.call(self, state);
					return;
				}
			};
			resource.onUnauthorized = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onUnauthorized) {
					controllerConfig.onUnauthorized.call(self, state);
					return;
				} 
				if (controllerConfig.onError){
					controllerConfig.onError.call(self,state);
					return;
				}
				router.redirect("/ui/login/login.html");
			};
			resource.onAccessDenied = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onAccessDenied) {
					controllerConfig.onAccessDenied.call(self, state);
					return;
				} 
				if (controllerConfig.onError){
					controllerConfig.onSuccess.call(self);
					return;
				}
			};
			resource.onNotFound = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onNotFound) {
					controllerConfig.onNotFound.call(self, state);
					return;
				} 
				if (controllerConfig.onError){
					controllerConfig.onError.call(self);
					return;
				}
			};
			resource.onCreated = function(state,location) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onCreated) {
					controllerConfig.onCreated.call(self, 
							 			this.getResponseHeader("Location"),
									    state);
					return;
				} 
				if(controllerConfig.onSuccess){
					controllerConfig.onSuccess.call(self,state);
				}			
			};
			resource.onRedirect = function(){
				if(controllerConfig.onRedirect) {
					// HTTP 3xx status codes must not have a response entity.
					// Hence no messages can be displayed.
					controllerConfig.onRedirect.call(self,
										 this.getResponseHeader("Location"),
										 state);
					return;
				}
				// A redirect can be both outcome of successful and a failed operation.
				// Hence onSuccess must not be invoked by default.
				
			};
			resource.onUpdated = function(state) {
				displayFlashMessages.call(self, state);
				if (controllerConfig.onUpdated) {
					controllerConfig.onUpdated.call(self);
					return;
				} 
				if(controllerConfig.onSuccess){
					controllerConfig.onSuccess.call(self,state);
				}
			};
		};
		if(controllerConfig.resource){
			this._attachEventListener.call(this,controllerConfig.resource); //SELF
		}
		if(controllerConfig.refresh){
			controllerConfig.refresh = controllerConfig.refresh.bind(this); //SELF
		}

	}
	
	/**
	 * Processes all <em>click</em> events that originate from the view.
	 * <p>
	 * The controller stops event propagation if the event was handled by any of the functions declared in the controller configuration.
	 * This function fires a <code>UIPreExecuteActionEvent</code> event before calling the event listener function if the event originates from a button 
	 * and a handler to process the event exists.
	 * </p>
	 * @returns {boolean} <code>true</code> if the event was handled by this controller, <code>false</code> if not.
	 */
	_onclick(event) {
		// Clear all messageboxes (e.g. select date message box)
		// TODO Remove this tailend fix to the date picker component! (Perhaps add a custom event!
		this.elements(".messagebox").forEach(messagebox => messagebox.clear());

		if(!this._page.buttons){
			// A page cannot handle a click event if no buttons are declared.
			return false;
		}
			
		// Search for the actual control being clicked
		let element = event.target;
		while(element && element.tagName !== "BUTTON" && element.tagName !== "A" && element.tagName !== "INPUT"){
			element = element.parentNode;
		}
		
		if(element && (element.tagName === "BUTTON" || element.tagName === "A" )) {
			// Search a handler for the clicked element.
			let handler = this._page.buttons[element.id];
			if (!handler) {
				handler = this._page.buttons[element.name];
			}
			if (handler) {
				event.preventDefault();
				event.stopPropagation();
				let form = document.querySelector('ui-form');
				if(form){
					let syncViewModel = new CustomEvent('UIPreExecuteAction');
					form.dispatchEvent(syncViewModel);
				}
				handler.call(this, new Location(window.location.href)); //SELF
				// Page has handled the click. No further actions required.
				return true;
			}
		}
		// Page did not handle the click.
		return false;	
	}
	
	/**
	 * Sets the view template.
	 * @param {String} content the view template
	 */
	setViewTemplate(content) {
		this._template = content;
	}

	getViewTemplate(){
		return this._template;
	}
	
	

	/**
	 * Processes all <em>change</em> events that originate from the view.
	 * <p>
	 * The controller stops event propagation if the event was handled by any of the functions declared in the controller configuration.
	 * </p>
	 * @returns {boolean} <code>true</code> if the event was handled by this controller, <code>false</code> if not.
	 */
	_onchange(event) {
		if(!this._page_selections){
			// Page cannot handle a select event if no selection handlers are declared.
			return false;
		}
		
		// Find registered selection handler
		// First, try to select the event handler by the element id.
		let element = event.target;
		var handler = this._page.selections[element.id];
		if (!handler) {
			// Second, try to select the handler by the element name.
			handler = this._page.selections[element.name];
			if(!handler){
				// Third, scan for pattern matches to select a handler.
				for (let pattern in this._page.selections) {
					if (element.name.match(pattern)) {
						handler = this._page.selections[pattern];
						break;
					}
				}
			}
			if(!handler){
				// Event cannot be handled if no appropriate handler exists.
				return false;
			}
		}

		if (element.options) {
			// Handle selected option
			var value = element.options[element.selectedIndex].value;
			handler.call(this, value, Element.wrap(element,this)); //SELF 2x
			return true;
		}
		if (element.value) {
			// Handle selected radio box or element
			handler.call(this, element.value, Element.wrap(element,this)); //SELF 2x
			return true;
		}
		// Unsupported element selected.
		return false;
	}
	
	/**
	 * Attaches all event listeners declared in the controller configuration of this controller to the specified resource.
	 * By that all events fired by the attached resource are handled by the event handlers declared in the controller configuration.
	 * <p>
	 * @param {Resource} resource - the resource to be attached
	 */
	attach(resource){
		this._attachEventListener(resource); 
	}
	
	/**
	 * Returns the <code>Element</code> that has triggered the currently processed event.
	 * @returns the <code>Element</code> that has triggered the currently processed event or <code>null</code> if the element is unknown.
	 */
	eventSource(){
		let target = window.event.target;
		if(target){
			return Element.wrap(target,this); //SELF
		}
		return null;
	}
	
	/**
	 * Loads the primary resource.
	 * @param {Object} [params] the parameters to be send to the resource. Defaults to the query parameters of the current location if parameters were omitted.	
     */
	load(params) {
		if (this._page.resource.load) {
			
			if(!this._page.viewModel){
				this._page.viewModel = function(model){
					return model;
				}
			};
			
			if (!this._page.init) {
				this._page.init = function(settings) {					
					this.render(settings);
				}.bind(this);
			}

			this._page.resource.onLoaded = async function(state) {
				// Initialize view model to support augmentations with this.updateViewModel in the viewModel implementation.
				this._viewModel = state
				// This allows the view model to aggregate data from various sources.
				// Wait for the view model to be loaded.
				this._viewModel = await this._page.viewModel.call(this,state);
				let root = document.querySelector("ui-root");
				root.setViewModel(this._viewModel);
				root.setController(this);
				if(this._page.init){
					this._page.init.call(this, this._viewModel); //SELF
				}
				this.renderMenu();
				this.renderView();
				// view model is available
				// => render menu 
				// => render view
				// => Inject view model in ui-root!
				if(this._page.postRender){
					this._page.postRender.call(this);
				}
				
			}.bind(this);
			this._page.resource.load(params ? params : this.location().params());
		}
	}
	
	/**
	 * Reloads the primary resource.
	 * <p>
	 * The reload method compares the specified parameters with the current query parameters and updates the browser history if the parameters have changed. This allows a user to navigate back to a previous state, which is particularly useful for list views when different filters are applied.
	 * @param {Object} [params] the parameters to be send to the resource. Defaults to the query parameters of the current location if parameters were omitted.	
     */
	reload(params){
		let location = this.location();
		let context = location.params();
		if(!params){
			// Reload the current page as it is if no params exist.
			this.load(context);
			return;
		}
		// Check whether params are a subset of the existing params
		let isSameContext = function(){
			for (let p in params){
				if(params[p] != context[p]){
					return false;
				}
			}
			for (let p in context){
				if(params[p] != context[p]){
					return false;
				}
			}
			return true;
		}
		
		if(isSameContext()){
			this.load(context);
			return;
		}
		
		// Context has changed.
		// Push it to browser history and reload the page.
		this.push({'view' : `/ui/views/${location.module()}/${location.view()}`,
				   '?':params});
		this.load(params); 
	}

	/**
	 * Navigates from the current view to the specified target view.
	 * @param {String|PathDescriptor} path the absolute path of the target view
	 */
	navigate(path) {
		path = Location.href(path);
		
		if (path.charAt(0) == '/') {
			// Absolute link can be used as is. 
			let link = new Location(path);
			router.navigate(link);
			return;
		}
		
		// Relative link must be converted to an absolute link to target page.
		let location = this.location();
		let module  = location.module();
		let app     = location.app();
		let folder  = module;
		if(app){
			folder+='/'+app;
		}
		
		let link = new Location(`/ui/views/${folder}/${path}`);
		router.navigate(link);
	};
	
	/**
	 * Redirects the user to the target view.
	 * <p>
	 * A redirect bypasses the routing logic and leaves the browser history untouched.
	 * </p>
	 * 
	 * @param {String|PathDescriptor} path the absolute path of the target view
	 */
	redirect(path) {
		router.redirect(Location.href(path));
	}
	
	/**
	 * Walks one step back in the browser history or redirect the user to the specified view if the browser history is empty.
	 * @param {String|PathDescriptor} path the absolute path to the view to be displayed when the browser history is empty
	 */
	back(path) {
		router.back(Location.href(path));
	}

	/**
	 * Returns the location of the current view.
	 * @returns {Location} the location of the current view.
	 */
	location() {
		return new Location(window.location.href);
	}

	/**
	 * Sets an attribute in the browser session store.
	 * @param {String} name the attribute name
	 * @param {*} value the attribute value
	 */
	setAttribute(name, value) {
		window.sessionStorage.setItem(name, value);
	}
	
	/**
	 * Reads an attributes of the browser session store.
	 * @param {String} name the attribute name
	 * @returns {*} the attribute value or <code>null</code> if the attribute does not exist.
	 */
	getAttribute(name) {
		return window.sessionStorage.getItem(name);
	}
	
	/**
	 * Returns the registered <em>change</em> event handler for the input control with the given name or
	 * <code>null</code> if no event handler exists.
	 * Returns all registered event handlers if the name was omitted.
	 * @param {String} [name] the name of the input control
	 * @return the event handler for the specified input control or all registered event handlers if no name was specified
	 */
	selections(name) {
		if (name) {
			if (this._page.selections) {
				let handler = this._page.selections[name];
				if(handler){
					return handler.bind(this);
				}
				for (let pattern in this._page.selections) {
					if (name.match(pattern)) {
						handler = this._page.selections[pattern];
						return handler.bind(this);
					}
				}
				return null;
			}
		}
		return this._page.selections;
	}

	/**
	 * Returns the registered <em>click</em> event handler for the button with the given name or
	 * <code>null</code> if no event handler exists.
	 * Returns all registered event handlers if the name was omitted.
	 * @param {String} [name] the button name
	 * @return the event handler for the specified button or all registered event handlers if no name was specified
	 */
	buttons(name) {
		if (this._page.buttons && name) {
			let button = this._page.buttons[name];
			if(button){
				return button.bind(this);
			}
			return undefined;
		}
		return this._page.buttons;
	}
	
	/**
	 * Sets the current view model.
	 * @param {Object} model the new view model
	 */
	setViewModel(model){
		this._viewModel = model;
		document.querySelectorAll("ui-root").setViewModel(this._viewModel);
	}

	/**
	 * Updates the view model by applying all values of the specified object to the current view model and 
	 * returns the updated view model.
	 * @param {Object} delta the changes to be applied to the view model
	 * @returns {Object} the updated view model
	 */
	updateViewModel(delta){
		if(typeof this._viewModel === "array"){
			this._viewModel = delta;
			document.querySelector("ui-root").setViewModel(this._viewModel);
			return this._viewModel;
		}
		if(this._viewModel){
			for (let property in delta){
				let ctx = this._viewModel;
				let path = property.split(/\.|\[|\]/);
				let i=0;
				for (; ctx && i < path.length - 1;i++){
					if(path[i]){
						if(typeof ctx == "array"){
							// Token must be an array index in that particular case.
							ctx = ctx[parseInt(path[i])];
							continue;
						}
						// Associative array, i.e. object access
						ctx = ctx[path[i]];
					}
				}	
				ctx[path[i]] = delta[property];
			}
		}
		return this._viewModel;
	}
	
	/**
	 * Returns the specified property of the current view model. Returns the view model root object if no property was specified.
	 * @param {String} [property] path to the requested property
	 * @returns the current view model, the requested property or <code>null</code> if the property does not exist.
	 */
	getViewModel(property){
		if(property){
			let ctx = this._viewModel;
			let path = property.split(/\.|\[|\]/);
			for (let i=0; ctx && i < path.length;i++){
				if(path[i]){
					if(typeof ctx == "array"){
						// Token must be an array index in that particular case.
						ctx = ctx[parseInt(path[i])];
						continue;
					}
					// Associative array, i.e. object access
					ctx = ctx[path[i]];
				}
			}
			return ctx;
		}
		return this._viewModel;
	}
	
	/**
	 * Renders the module menu for the specified view model.
	 * @param {Object} {model} the view model. Defaults to {@link #getViewModel()} if not specified.
	 */
	renderMenu(model){
		if(!model){
			model = this.getViewModel();
		}
		let location = this.location();
		let module = this.module();
		let menu = this.element("menu");
		if(menu){
			menu.html(Mustache.render(module.getMenuTemplate(), module.computeMenuViewModel(model)));
			module.select(location);
		}
	}
	
	/**
	 * Renders the module menu for the specified view model.
	 * @param {Object} {model} the view model. Defaults to {@link #getViewModel()} if not specified.
	 */
	renderView(model){
		if(!model){
			model = this.getViewModel();
		}

		let html = this.template().html(model);
		let container = this.element("view-container");
		container.html(html);
		// Some browsers loose the autofocus when adding new objects to the DOM. Hence focus has to be set again.
		let autofocus = container.select("[autofocus]");
		if(autofocus){
			autofocus.focus();
		}
		let heading = container.select("h2");
		if(heading){
			document.title = heading.text();
		}
	}

	/**
	 * Renders the entire view by calling {@link #renderMenu(model)} and {@link #renderView(model)}.
	 * @param {Object} [model] the view model. Defaults to {@link #getViewModel()} if not specified.
	 */
	render(model) {
		this.renderMenu(model);
		this.renderView(model);
	}
	
	/**
	 * Returns the module name.
	 * @returns the module name.
	 */
	module(){
		return Modules.getModule(this.location().module())
	}
	
	/**
	 * Binds the specified element to this controller by subscribing the <em>click</em> and <em>change</em> events of the element.
	 * @param {Element} element the element to be bound to this controller.
	 */
	bind(element){
		element.addEventListener("click",this.newEventHandler(this._onclick));
		element.addEventListener("change",this.newEventHandler(this._onchange));
	}
	
	/**
	 * Wraps a property value in a function in order to create a <em>transient</em> property that can be added to the view model.	
	 * A transient property is not serialized into the JSON representation of an object. By that, transient property will not be passed
	 * to the resource when calling the REST API.
	 * @param {*} property the property value
	 * @return {function} a currying function that returns the property value.
	 */
	transient(property){
		return function(){
			return property;
		}
	}
	
	/**
	 * Binds an event handler to this controller to make all controller methods accessible through the <code>this</code> pointer.
	 * @param {function} f the event handler
	 * @return {function} the event handler with the <code>this</code> pointer bound to this controller
	 */
	newEventHandler(f) {
		return f.bind(this);
	};
	
	/**
	 * Pushes a  path to the browser history. 
	 * @param {String|PathDescriptor} path the path to be pushed to the browser history
	 */
	push(path) {
		path = Location.href(path);
		let state = {
			"href" : window.location.href
		};
		window.history.pushState(state, null, path);
	}

	/**
	 * Displays an error flash message.
	 * @param {String} message the human-friendly message text
	 */
	error(message) {
		displayFlashMessages([ {
			"severity" : "ERROR",
			"message" : message
		} ]);
	}
	
	/**
	 * Displays a flash message.
	 * @param {Message} the message to be displayed
	 */
	message(message){
		displayFlashMessages([message]);
	}

}

/**
 * Displays all input error messages.
 * @param {Element} inputElement The element with an invalid value
 * @param {string} severity The severity of the message 
 * @param {string} message The error message
 */
function displayInputError(inputElement, severity, message) {
	let errorElement = document.createElement('div');
	errorElement.classList.add('error');
	errorElement.appendChild(document.createTextNode(message));
	try {
		let inputContainer = inputElement.parentNode;
		let formGroup = inputContainer.parentNode;
		formGroup.classList.add('errored');
		formGroup.insertBefore(errorElement, inputContainer.nextSibling);
	} catch (e) {
		displayFlashMessage(severity, message);
		let container = document.querySelector("div[class~='flash-messages']");
		container.classList.remove('hidden');
		window.setTimeout(clearFlashMessages, 5000);
	}
}

/**
 * Clears an input error.
 */
function clearInputError() {
	let formGroup = event.target.parentNode.parentNode;
	formGroup.classList.remove('errored');
	let error = formGroup.querySelector("div[class='error']");
	if (error) {
		formGroup.removeChild(error);
	}
}
// Clear input error if new input is provided for a input field.
document.addEventListener('input', clearInputError);

//** END MODULE API


/**
 * Clears all flash messages.
 */
function clearFlashMessages() {
	let container = document.querySelector("div[class~='flash-messages']");
	container.classList.add('hidden');
	let messages = container.querySelectorAll('div');
	for (var i = 0; i < messages.length; i++) {
		container.removeChild(messages[i]);
	}
	container.classList.remove('hidden');
}

/**
 * Displays the given messages as flash messages. A flash message is displayed on the bottom of the view to
 * report global errors which cannot be bound to a certain input field. Flash messages are automatically cleared
 * after a few seconds.
 * @param messages {Message|Message[]} the flash messages
 */
function displayFlashMessages(messages) {
	clearFlashMessages();
	if (!messages || !(messages.forEach || messages.severity && messages.message)) {
		// Not a valid message
		return;
	}
	if (messages.forEach) {
		messages.forEach(function(message) {
			displayFlashMessage(message.severity, 
								message.reason, 
								message.message);
		});
	} else {
		displayFlashMessage(messages.severity, 
							messages.reason, 
							messages.message);
	}
	let container = document.querySelector("div[class~='flash-messages']");
	container.classList.remove('hidden');
	window.setTimeout(clearFlashMessages, 5000);
}

/**
 * Displays a flash message.
 * @param {String} severity the message severity
 * @param {String} reason the message reason code
 * @param {String} text the human-friendly message text
 */
function displayFlashMessage(severity, reason, text) {
	let message = document.createElement('div');
	message.classList.add('flash');
	if (severity === 'WARNING') {
		message.classList.add('flash-warn');
	} else if (severity === 'ERROR') {
		message.classList.add('flash-error');
	}
	if(reason){
		message.innerHTML = `<p>${reason} - ${text}</p>`;
	} else {
		message.innerHTML = `<p>${text}</p>`;
	}
	document.querySelector("div[class~='flash-messages']")
			.appendChild(message);
}

const CTRL_KEY = 17;
const KEY_1    = 49;
const KEY_2    = 50;
const KEY_3    = 51;
const KEY_4    = 52;
const KEY_5    = 53;
const KEY_6    = 54;
const KEY_7    = 55;
const KEY_8    = 56;
const KEY_9    = 57;
const KEY_0    = 48;

Menu.keydown = function(){
	if(event.keyCode == CTRL_KEY){
		this.keyCodePressed = true;
		return;
	}
	if(this.keyCodePressed){
		switch(event.keyCode){
			case KEY_1:{
				let input = document.getElementsByTagName('input');
				if(input){
					for (let i=0; i < input.length; i++){
						if(input[i].disabled || input[i].readonly || input[i].type==='hidden'){
							continue;
						}
						input[i].focus();
						break;
					}
				}
				break;
			}
			case KEY_2:
			case KEY_3:
			case KEY_4:
			case KEY_5:
			case KEY_6:
			case KEY_7:
			case KEY_8:
			case KEY_9:{
				var menu = Math.abs(KEY_2-event.keyCode);
				var menus = document.querySelectorAll('#module-container #menu nav.menu');
				if(menus[menu]){
					menus[menu].getElementsByTagName('a')[0].focus();
				}
				break;
			}
			case KEY_0:{
				document.querySelector('.tabnav-tab').focus();
				break;
			}
		}
	}
}

Menu.keyup = function(){
	if(event.keyCode == CTRL_KEY){
		this.keyCodePressed = false;
	}
}

window.addEventListener('keydown',Menu.keydown);
window.addEventListener('keyup',Menu.keyup);

