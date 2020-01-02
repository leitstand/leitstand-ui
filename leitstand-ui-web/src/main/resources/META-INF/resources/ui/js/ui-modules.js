
import {Json} from './client.js';
import {router,Location} from './ui-core.js';


/**
 * Container for all top-level menu tabs
 */
export let mainMenu = null;

/**
 * Creates a new main-menu controller.
 * @constructor
 * @param {string} id The element ID of the tab container
 * @param {object} menu The available tabs as menu items.
 * @classdesc
 * Controller for top-level tabs to navigate between different UI modules.
 */
class MainMenu {
	
	constructor(menu){
		this._menu = menu;
	}

	select(tab){
		let selected = document.querySelector(".tabnav-tabs>a[class~='selected']");
		if (selected) {
			selected.classList.remove("selected");
			selected.setAttribute("aria-selected","false");
		}
		selected = document.querySelector(`.tabnav-tabs a[data-module='${tab}']`);
		selected.classList.add("selected");
		selected.setAttribute("aria-selected","true");
		document.querySelector("h1").innerHTML = selected.getAttribute("data-title");
		document.querySelector("#subtitle").innerHTML = selected.getAttribute("title");
		
	}

}

class Modules extends HTMLElement {
	
	connectedCallback(){
		document.addEventListener('UIModulesLoaded',function(event){
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
			
			mainMenu._menu.forEach(item => modulesMenu.appendChild(renderItem(item.label,
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
		}.bind(this));
	}
	
}

customElements.define('ui-modules',Modules);


window.addEventListener("load",function(){
	let json = new Json("/api/v1/ui/modules");

	json.onLoaded = function(items){
		mainMenu = new MainMenu(items);
		let modulesLoaded = new CustomEvent('UIModulesLoaded',{'detail':items}) ;
		document.dispatchEvent(modulesLoaded);
		router.navigate(new Location(window.location.href));
	};
	json.onUnauthorized=function(){
		window.location.replace("/ui/login/login.html");
	};
	json.onForbidden=function(){
		window.location.replace("/ui/login/login.html");
	};
	json.load();
});
