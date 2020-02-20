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


// Main menu
let _mainMenu = null;
// Leitstand modules
let modules = {};


/**
 * Creates a new main-menu controller.
 * @constructor
 * @param {string} id The element ID of the tab container
 * @param {object} menu The available tabs as menu items.
 * @classdesc
 * Controller for top-level tabs to navigate between different UI modules.
 */
class MainMenu {
	
	static instance(){
		if(_mainMenu){
			return _mainMenu;
		}
		let request = new XMLHttpRequest();
		request.open("GET","/api/v1/ui/modules",false);
		request.send();
		if(request.status == 200){
			let modules = JSON.parse(request.responseText);
			_mainMenu = new MainMenu(modules);
			let modulesLoaded = new CustomEvent('UIModulesLoaded',{'detail':modules}) ;
			document.dispatchEvent(modulesLoaded);
			return _mainMenu;
		}
	}
	
	
	constructor(menu){
		this._menu = menu;
	}

	select(tab){
		let selected = document.querySelector(".tabnav-tabs>a[class~='selected']");
		let select = document.querySelector(`.tabnav-tabs a[data-module='${tab}']`);
		
		if(selected == select){
			return false; // No changes needed.
		}
		
		
		if (selected) {
			selected.classList.remove("selected");
			selected.setAttribute("aria-selected","false");
		}
		
		select.classList.add("selected");
		select.setAttribute("aria-selected","true");
		document.querySelector("h1").innerHTML = select.getAttribute("data-title");
		document.querySelector("#subtitle").innerHTML = select.getAttribute("title");
		
		return true;
	}

}

export class Modules extends HTMLElement {
	
	static select(item){
		if(_mainMenu){
			return _mainMenu.select(item);
		}
	}
	
	
	static getModule(name){
		return modules[name];
	}
	
	connectedCallback(){
		
		document.addEventListener("DOMContentLoaded",function(){
		
		let _mainMenu = MainMenu.instance();
		if(!_mainMenu){
			//TODO Main menu error view.
			window.location.replace("/ui/login/login.html");
			return;
		}

		
		// Create header
		let header = document.createElement('div');
		header.classList.add('header');
		let title = document.createElement('h1');
		title.setAttribute('id','title');
		header.appendChild(title);
		let subtitle = document.createElement('p');
		subtitle.setAttribute('id','subtitle')
		subtitle.classList.add('lead');
		header.appendChild(subtitle);
		this.appendChild(header);
		
		
		// Create main menu DOM
		let modulesMenu = document.createElement('nav');
		modulesMenu.classList.add('tabnav-tabs');
		modulesMenu.style.position='relative';

		let renderItem = function(label, path, module, title, subtitle, position) {
			let item = document.createElement("a");
			item.classList.add("tabnav-tab");
			if(position){
				item.classList.add(position);
			}
			item.setAttribute("href","/ui/views" + path);
			item.setAttribute("title",subtitle);
			item.setAttribute("data-title", title);
			item.setAttribute("data-module", module);
			item.setAttribute("role","tab");
			item.appendChild(document.createTextNode(label));
			return item;
		};
		

		let logout = document.createElement('a');
		logout.classList.add('btn');
		logout.classList.add('btn-outline');
		logout.classList.add('btn-sm');
		logout.classList.add('right');
		logout.style='margin-left: 10px; margin-top: 5px';
		logout.innerText='Logout';
		logout.href='/api/v1/_logout';
		modulesMenu.appendChild(logout);
		
		_mainMenu._menu.forEach(item => modulesMenu.appendChild(renderItem(item.label,
																		   item.path,
																		   item.module,
																		   item.title, 
																		   item.subtitle, 
																		   item.position)));	
		
		

		
		// Create a container for all main menu items.
		let modulesMenuContainer = document.createElement('div');
		modulesMenuContainer.classList.add('tabnav');
		modulesMenuContainer.setAttribute('role','tablist');
		modulesMenuContainer.appendChild(modulesMenu);
		this.appendChild(modulesMenuContainer);
		
		// Create a container for the module content
		let moduleContainer = document.createElement('div');
		moduleContainer.setAttribute('id','module-container');
		moduleContainer.setAttribute('role','tabpanel');
		moduleContainer.classList.add('container');
		this.appendChild(moduleContainer);
		
		router.navigate(new Location(window.location.href));
		
		}.bind(this));	
		
		
	}
	
}

customElements.define('ui-modules',Modules);


window.addEventListener('UIModuleLoaded',async function(event){
	let module = new Module(event.detail.module);
	module.load(event.detail.location);
});

window.addEventListener('UIApplicationLoaded',function(event){
	router.navigate(event.detail.location);
});

window.addEventListener('UIOpenModule',function(event){
	let module = modules[event.detail.module];
	document.getElementById('module-container').innerHTML=module.getModuleTemplate();
});

window.addEventListener('UIOpenView',async function(event){
	let location = event.detail.location;
	let module = modules[location.module()];
	if(module){
		let view = module.getController(location.view());
		if (!view) {
			// Attempt to lazy load the application. 
			view = await module.loadApplication(location);
			if(!view){
				// Skip event processing. This view is presumably part of a Leitstand extension.
				console.debug(`Unknown view ${location.view()} in application ${location.app()} of module ${location.module()}`);
				return;
			}
		}
		let template = 	view.getViewTemplate();
		if(!template){
			// Load view template and render view.
			let html = new Html(`/ui/modules/${location.module()}/${location.view()}`);
			template = await html.load();
			view.setViewTemplate(template);
		}
		view.load();
	}
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
 * Leitstand UI module.
 * <p>
 * The Leitstand UI consists of modules.
 * Each module can be divided into <em>applications</em>, which are shipped with the module.
 * The resources of an application are located in a sub-folder of the module root folder.
 * The folder name is also the application name.
 * The module root folder contains the default application which typically provides the module welcome view.
 */
class Module {
	
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
		if(!this._descriptor.menu_template){
			this._descriptor.menu_template = 'menu-template.html';
		}
		
	}

	/**
	 * Loads the module and all dependent applications.
	 */
	async load(link){
		if(!link){
			link = new Location(window.location.href);
		}
		
		// Load all missing javascript libraries.
		try{
			//TODO: Load a list of libraries (Promise.all)
			let main = await import(`/ui/modules/${link.module()}/${this._descriptor.controller}`); // TODO: Use generic library rather than controller. Support a list of libraries. Await all of them. Search for menu.
			this._menu = main.menu;
			modules[link.module()]=this; // Register module.
			
			for(let i=0; i < this._descriptor.applications.length; i++){
				try{
					let app = this._descriptor.applications[i];
					// TODO Load a list of libraries. (Promise.all
					let library = await import(`/ui/modules/${this._descriptor.module}/${app.application||app}/${app.controller||'controller.js'}`);
					this._menu.merge(library.menu,app);
				} catch(e){
					console.log(`/ui/modules/${link.module()}/${this._descriptor.applications[i]} reported a ${e}`);
				}
			}
			
			let templateLoader = new Html(`/ui/modules/${this._descriptor.module}/${this._descriptor.template}`);
			this._moduleTemplate = await templateLoader.load();
			templateLoader = new Html(`/ui/modules/${this._descriptor.module}/${this._descriptor.menu_template}`);
			this._menuTemplate = await templateLoader.load();	
			
			document.getElementById('module-container').innerHTML=this.getModuleTemplate();
			Modules.select(this.name)
			
			window.dispatchEvent(new CustomEvent('UIOpenView',{'detail':{'location':link}}));
		} catch (e){
			alert(`/ui/modules/${link.module()}/${this._descriptor.controller} reported a ${e}`);
			throw e;
		}
		
	};
	
	async loadApplication(location){
		let app = location.app();
		let lib = await import(`/ui/modules/${location.module()}/${location.app()}/controller.js`);
		if(lib.menu){
			this._menu.merge(lib.menu,{"application":app});
		}
		return this.getController(location.view());
	}
	
	
	/**
	 * Returns the view controller for the specified view or <code>null</code> if the view does not exist.
	 * @param {string} view the module-scoped view location
	 * @returns {Controller} the view controller
	 */
	getController(view){
		return this._menu._views[view];
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
	 * Return the menu template.
	 * @returns {string} the menu template.
	 */
	getMenuTemplate(){
		return this._menuTemplate;
	}
	
	/**
	 * Return the module template.
	 * @returns {string} the menu template.
	 */
	getModuleTemplate(){
		return this._moduleTemplate;
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
					// Menu is not enabled because user has none of the required roles
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

/**
 * Start a timer to periodically refresh the current view if the view controller supplies a <code>refresh</code>callback.
 */
function startAutoRefresh(){
	
	let refresh = function(){
		try{
			let link = new Location(window.location.href);
			let module = Modules.getModule(link.module());
			if(module){
				let controller = module.getController(link.view());
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
