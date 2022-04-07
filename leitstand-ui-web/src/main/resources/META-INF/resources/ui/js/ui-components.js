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
 * <h2>UI Component Library</h2>
 * <p>
 * The UI Component Library provides HTML Web Components to facilitate the UI development by means of lean and self-explanatory UI view templates and an automated data-binding mechanism.
 * </p>
 * The table below lists all existing UI components:
 * <table>
 *  <thead>
 * 	 <tr><td>Component</td><td>Description</td></tr>
 *  </thead>
 *  <tbody>
 * 	 <tr><td><code>&lt;ui-actions&gt;</code></td><td>A container for all available actions.</td></tr>
 *   <tr><td><code>&lt;ui-blankslate&gt;</code></td><td>A blankslate to display that an entity does not exist or a resource collection is empty.</td></tr>
 * 	 <tr><td><code>&lt;ui-button&gt;</code></td><td>A button to execute an action.</td></tr>
 * 	 <tr><td><code>&lt;ui-checkbox&gt;</code></td><td>A checkbox.</td></tr>
 *   <tr><td><code>&lt;ui-composition&gt;</code></td><td>A container to arrange multiple input elements side-by-side.</td></tr> 
 *   <tr><td><code>&lt;ui-code&gt;</code></td><td>A code block with syntax highlighting.</td></tr>
 *   <tr><td><code>&lt;ui-confirm&gt;</code></td><td>A confirm dialog to ask a user to confirm an action before the action is executed.</td></tr>
 *   <tr><td><code>&lt;ui-date&gt;</code></td><td>A date picker. Supports different date, date-time and timestamp format. Renders a formatted date when readonly.</td></tr>
 * 	 <tr><td><code>&lt;ui-form&gt;</code></td><td>An input form.</td></tr>
 * 	 <tr><td><code>&lt;ui-group&gt;</code></td><td>A group of input elements rendered as a field set.</td></tr>
 * 	 <tr><td><code>&lt;ui-input&gt;</code></td><td>A text input field.</td></tr>
 * 	 <tr><td><code>&lt;ui-note&gt;</code></td><td>A note to provide detailed explanation or instructions.</td></tr>
 * 	 <tr><td><code>&lt;ui-password&gt;</code></td><td>A password input field.</td></tr>
 * 	 <tr><td><code>&lt;ui-radio&gt;</code></td><td>A radio button.</td></tr>
 * 	 <tr><td><code>&lt;ui-select&gt;</code></td><td>A select box.</td></tr>
 *   <tr><td><code>&gt;ui-tags&gt;</code></td><td>A tag editor to manage tags as string array.</td></tr>
 * 	 <tr><td><code>&lt;ui-textarea&gt;</code></td><td>A textarea.</td></tr>
 * 	 <tr><td><code>&lt;ui-view-header&gt;</code></td><td>Header section of a UI view consisting of title, subtitle and breadcrumbs.</td></tr>
 * 	 <tr><td><code>&lt;ui-view&gt;</code></td><td>The container element of the displayed view.</td></tr>
 *  </tbody>
 * </table>
 * <p>
 * See the component class description for further details and examples on how to use the component.
 * </p>
 * <h3>Class Diagram</h3>
 * The UML class diagram below illustrates the UI component class model.
 * The UI component element name is depicted as well. 
 * Classes without element name are either base or utility classes.
 * <img src="./img/components.png" alt="UML Class Diagram">
 * 
 * <h3>View Model</h3>
 * The view model encapsulates the data being displayed in the UI. 
 * The view model can be federated from multiple REST API invocations and can also be augmented by adding additional functions.
 * The <em>Controller</em> builds the view model and passes it to the view and the component model respectively.
 * The <code>ViewModel</code> class decorates the view model by means of adding functions to access the view model state, 
 * i.e. reading and writing view model properties. 
 * The <code>View</code> component maintains the view model for the entire view.
 * <h3>Data Binding</h3>
 * <em>Data Binding</em> is the process of binding the view model properties to the input controls. 
 * Each <code>FormElement</code> is automatically bound to the view model.
 * First, the <code>bind</code> attribute is read. 
 * If present, the <code>bind</code> attribute is supposed to contain the JSON path to the view model property bound to this control.
 * If no <code>bind</code> attribute has been set, the control is bound to the view model property with the same name as the control.
 * <p>
 * The view model property value defaults to the value set in the <code>value</code> attribute if the property does not exist, 
 * irrespective whether the property path was derived from the <code>bind</code> or <code>name</code> attribute.
 * @module
 */

import {UserContext,Location,router} from './ui-core.js';
import {Modules} from './ui-modules.js';
import {Json} from './client.js';
import {Element} from './ui-dom.js';

/**
 * View model decorator that provides convenience functions to read and update view model properties.
 */
class ViewModel{
	
	/**
	 * Creates a new view model decorator.
	 * @param {Object} the current view model
	 */
	constructor(data){
		this._model = data;
	}
	
	/**
	 * Returns the view model property with the specified path.
	 * @param {String} path the property JSON path
	 * @returns {Details|array|string|boolean|number} the view model property or <code>null</code> if the property does not exist
	 */
	getProperty(path){
		if(path){
			let parent = this._model;
			let ctx = this._model;
			let segments = path.split(/\.|\[|\]/);
			for (let i=0; ctx && i < segments.length;i++){
				parent = ctx;
				if(segments[i]){
					if(Array.isArray(ctx)){
						// Token must be an array index in that particular case.
						ctx = ctx[parseInt(segments[i])];
						continue;
					}
					// Associative array, i.e. Details access
					ctx = ctx[segments[i]];
				}
			}
			if(typeof ctx === 'function'){
				ctx = ctx.call(parent);
			}
			return ctx;
		}
		return null;
	}
	
	/**
	 * Updates an existing view model property or adds a new property to the view model if the property does not exist.
	 * @param {String} path the property JSON path
	 * @param {Object|string|number|boolean|array} value the property value
	 */
	setProperty(path,value){
		 const segments = path.split(/\.|\[|\]/);
		 let i=0;
		 let ctx = this._model;
		 for (; ctx && i < segments.length - 1;i++){
			if(segments[i]){
				if(typeof ctx == "array"){
					// Token must be an array index in that particular case.
					ctx = ctx[parseInt(segments[i])];
					continue;
				}
				// Associative array, i.e. Details access
				let nested = ctx[segments[i]];
				if(!nested){
					nested = {};
					ctx[segments[i]] = nested;
				}
				ctx = nested;
			}
		}
		ctx[segments[i]] = value;
		const form = document.querySelector('ui-form');
		if(form){
		    form.dispatchEvent(new CustomEvent('UIViewModelUpdate'));
		}
	}
	
	/**
	 * Removes a property from the view model.
	 * Fails silently if the property does not exist.
	 * @param {String} path the property JSON path
	 */
	removeProperty(path){
		 const segments = path.split(/\.|\[|\]/);
		 let i=0;
		 let ctx = this._model;
		 for (; ctx && i < segments.length - 1;i++){
			if(segments[i]){
				if(typeof ctx == "array"){
					// Token must be an array index in that particular case.
					ctx = ctx[parseInt(segments[i])];
					continue;
				}
				// Associative array, i.e. Details access
				let nested = ctx[segments[i]];
				if(!nested){
					nested = {};
					ctx[segments[i]] = nested;
				}
				ctx = nested;
			}
		}
		delete ctx[segments[i]];
	}
	
	/**
	 * Tests whether the specified view model property has the expected value.
	 * If the view model property is an array, the method tests whether the array <em>includes</em> the expected value.
	 * Otherwise, the method use a type-converting compare (<code>==</code>) in order to compare the expected value with the value in the view model.
	 * @param {String} path the property JSON path
	 * @param {String|Number|boolean} expectedValue the value to be tested agains the view model value
	 * @returns {boolean} <code>true</code> when the view model value matches the expected value, <code>false</code> if not.
	 */
	test(path,expectedValue){
		const value = this.getProperty(path);
		if(value == expectedValue){
			return true;
		}
		if(Array.isArray(value)){
			return value.includes(expectedValue);
		}
		return `${expectedValue}`==`${value}`;
	}
	
	/**
	 * Tests whether the view model contains a certain property.
	 * @param {String} path the property JSON path
	 * @returns {boolean} <code>true</code> if the property is defined, <code>false</code> if not.
	 */
	contains(path){
		return this.getProperty(path) !== undefined;
	}
	
}


/**
 * Base class for all UI components.
 * <p>
 * All UI components can be <code>conditional</code> by declaring the <code>when</code> attribute.
 * A conditional UI component is only displayed, when the view model property specified in the <code>when</code> attribute exists and the value is not <code>null</code>, <code>false</code>, <code>0</code>, or an empty string.
 * If the <code>when</code> attribute refers to a function, the function is called and the return value must satisfy the conditions outlined before.
 * </p>
 * @extends HTMLElement
 */
export class UIElement extends HTMLElement {
	
	/**
	 * Initializes the UI element and lookups the view component.
	 * @throws an exception if no root component exists.
	 */
	constructor(){
		super();
		this._view = document.querySelector('ui-view');
	}

	/**
	 * Returns the current view model.
	 * @returns {ViewModel} the current view model.
	 */
	get viewModel(){
		return this._view.viewModel;
	}
	
	get view() {
		return this._view
	}
	
	/**
	 * Returns the controller of the current view.
	 * @returns {ui~Controller} the controller of the current view.
	 */
	get controller(){
		return this._view.controller;
	}
	
	/**
	 * Returns the view location.
	 */
	get location(){
		return this.controller.location
	}
	
	/**
	 * Returns the form of the current view or <code>null</code> if no form is displayed.
	 * return {Form} the form UI component
	 */
	get form(){
		return this._view.querySelector('ui-form');
	}
	
	/**
	 * Returns the unique ID of this UI element.
	 * Defaults to the <code>name</code> attribute if no <code>id</code> attribute was specified.
	 * @returns {String} the unique element ID
	 */
	get id(){
		const id = this.getAttribute('id');
		if(id){
			return id;
		}
		return this.getAttribute('name');
	}
	
	/**
	 * Returns the CSS style class.
	 * Returns an empty string if no style class was specified.
	 * @returns {String} the CSS classes or an empty string if no classes were specified.
	 */
	get _class(){
		const _class = this.getAttribute('class');
		if(_class){
			return _class;
		}
		return '';
	}
	
	/**
	 * Tests whether a component flag is set.
	 * A flag is set when the corresponding element attribute value is either <code>true</code> or no value was specified and the attribute is present only.
	 * @param {String} name the attribute name
	 */
	isFlagSet(name){
		const attr = this.getAttribute(name);
		return attr == '' || attr == 'true';
	}

	/**
	 * Renders the DOM and evaluates the <code>when</code> attribute if specified. 
	 * The <code>when</code> attribute states which view model property needs to be present to display this UI element.
	 * @see #renderDom()
	 */
	connectedCallback(){
		this.renderDom();
		const when = this.getAttribute('when');
		if(when){
            if(!!!this.viewModel.getProperty(when)){
                this.classList.add('hidden');
            }
            if(this.form){
                this.form.addEventListener('UIViewModelUpdate',(evt) => {
                    if(!!this.viewModel.getProperty(when)){
                        this.classList.remove('hidden');
                    } else {
                        this.classList.add('hidden');
                    }
                });
            }		        
		}
        if(this.when){
            if(!this.when()){
                this.classList.add('hidden');
            }
            if(this.form){
                this.form.addEventListener('UIViewModelUpdate',(evt) => {
                    if(this.when()){
                        this.classList.remove('hidden');
                    } else {
                        this.classList.add('hidden');
                    }
                });
            }                   
        }
	}

	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		// Render body as it is by default.
		// UIElement can be leveraged to implement conditional clauses.
	}
	
	requires(resources,action){
		
		return new Promise(function(resolved,rejected){
		
			const head = document.head;
			const elements = [];
			const loadResources = function(){
				if(elements.length == 0){
					resolved();
					return;
				}
				const element = elements.shift();
				element.onload = loadResources;
				head.appendChild(element);
			}
			
			const addStylesheet = function(href){
				const stylesheets = head.querySelectorAll("link[rel='stylesheet']");
				for(let i=0; i < stylesheets.length; i++){
					const stylesheet = stylesheets[i];
					if(stylesheet.href.endsWith(href)){
						return;
					}
				}
				const stylesheet = document.createElement('link');
				stylesheet.rel='stylesheet';
				stylesheet.href=href;
				elements.push(stylesheet);	
			}
			
			const addLibrary = function(src){
				const scripts = head.querySelectorAll('script');
				for(let i=0; i < scripts.length; i++){
					const script = scripts[i];
					if(script.src.endsWith(src)){
						return;
					}
				}
				const script = document.createElement('script');
				script.type='text/javascript';
				script.src=src;
				elements.push(script);
			}
			
			if(resources.lib){
				addLibrary(resources.lib);
			}
			
			if(resources.libs){
				resources.libs.forEach(lib => addLibrary(lib));
			}
			
			if(resources.stylesheet){
				addStylesheet(resources.stylesheet);
			}
			
			if(resources.stylesheets){
				resources.stylesheets.forEach(stylesheet => addStylesheet(stylesheet));
			}
			
			loadResources();
		
		});
		
	}

}


/**
 * View component of the view component tree.
 * <p>
 * The root component maintains the view model for the entire UI component tree.
 * @extends UIElement
 * @example <caption>Declaration of UI View Component</caption>
 * <ui-view>
 *   <!-- UI view elements -->
 * </ui-view>
 */
class View extends HTMLElement {

	/**
	 * Creates a new root component with an empty view model.
	 */
	constructor(){
		super();
		this._viewModel = new ViewModel({});
	}
	
	/**
	 * Renders the root container HTML element.
	 */
	connectedCallback(){
		this.addEventListener('UIRenderView',(evt) =>{
	       if(!evt.detail.viewOnly){
	           const detail = evt.detail;
	           detail.renderView = true;
	           this.dispatchEvent(new CustomEvent('UIRenderMenu',
	                                              { bubbles : true,
	                                                detail : detail }));
	        } else {
	            this.renderView(evt.detail);
	        }
		});
		
		this.addEventListener('change',function(event) {
			const location = new Location(window.location.href);
			const module = Modules.getModule(location.module);
			if(module){
				const controller = module.getController(location);
				controller._onchange(event);
			}
		});	
		
		this.addEventListener('click', function(){
			const location = new Location(window.location.href);
			const module = Modules.getModule(location.module);
			if(module){
				const controller = module.getController(location);
				if(controller && controller._onclick(event)){
					return; // No more action required. Controller exists and view handled the click event.
				}
			}	
		});
		
		
	}
	
	renderView(view){
        this._viewModel = new ViewModel(view.viewModel);
        const location = view.location;
        const module = Modules.getModule(location.module);
        this._controller = module.getController(location);
        this._controller.renderView();   
	}
	
	get module() {
		return this._controller.module;
	}

	get location(){
		return this._controller.location;
	}
	
	get controller(){
		return this._controller;
	}
	
	get viewModel(){
		if(!this._viewModel){
			this._viewModel = new ViewModel({});
		}
		return this._viewModel;
	}
}

/**
 * UI view-header component.
 * <p>
 * The view header is displayed on top of every view and consists of a mandatory title, 
 * an optional subtitle and 
 * optional breadcrumbs to walk from a detail view to the parent view.
 * <p>
 * @extends UIElement
 * @example	<caption>Minimal View Header</caption>
 * <ui-view-header>
 *   <ui-title>User Profile</ui-title>
 * </ui-view-header>
 * @example <caption>View Header With Optional Subtitle</caption>
 * <ui-view-header>
 *   <ui-title>User Profile</ui-title>
 *   <ui-subtitle>Manage your personal settings</ui-subtitle>
 * </ui-view-header>
 * @example <caption>View Header With Breadcrumbs</caption>
 * <ui-view-header>
 *   <ui-breadcrumbs>
 *     <ui-breadcrumb href="users.html">User Profiles</ui-breadcrumb>
 *     <!-- Omit href attribute to render last token as text -->
 *     <ui-breadcrumb>{{user_name}}</ui-breadcrumb>
 *   </ui-breadcrumbs>
 *   <ui-title>{{user_id}} User Profile</ui-title>
 *   <ui-subtitle>Manage user profile of {{given_name}} {{sur_name}}</ui-subtitle>
 * </ui-view-header>
 */
class ViewHeader extends UIElement{
	
	/**
	 * Renders the view header DOM.
	 */
	renderDom(){
		
		let breadcrumb = '';
		let breadcrumbDelimiter = ''
		this.querySelectorAll('ui-breadcrumb').forEach(item => {
			breadcrumb += breadcrumbDelimiter;
			if(item.hasAttribute('href')){
				breadcrumb+= (html `<a href="$${item.getAttribute('href')}" title="$${item.getAttribute('title')}">${item.innerHTML}</a>`);
			} else {
				breadcrumb+= (html `<span $${item.getAttribute('title')}>${item.innerHTML}</span>`);
			}
			breadcrumbDelimiter = ' / ';
		});
		// TODO Use ol or ul for breadcrumbs to obey accessibility constraints.
		breadcrumb = `<div class="breadcrumbs">${breadcrumb}</div>`;	
			
		
		let title = this.querySelector('ui-title');
		if(title){
			title = `<h3>${title.innerHTML}</h3>`;
		} else {
			title = '';
		}
		let subtitle = this.querySelector('ui-subtitle');
		if(subtitle){
			subtitle = `<p class="note">${subtitle.innerHTML}</p>`;
		} else {
			subtitle = '';	
		}
		
		const stylesheets = [...this.querySelectorAll('ui-stylesheet')].map(s => s.getAttribute("href")).filter(s => s != "");
		if (stylesheets && stylesheets.length > 0){
			this.requires({'stylesheets':stylesheets})
			    .then(()=>{
						this.innerHTML = `<div class="title">
		                    ${breadcrumb}
		                    ${title}
		                    ${subtitle}
		                  </div>`;
				});
		} else {
			this.innerHTML = `<div class="title">
			                    ${breadcrumb}
			                    ${title}
			                    ${subtitle}
			                  </div>`;			
		}
		
	}
	
}

/**
 * UI note component.
 * <p>
 * A note typically provides some guidance or additional information to an input element.
 * @extends UIElement
 * @example <caption>Example Note Explaining Password Policy</caption>
 * <ui-note>The password must consist of at least 10 characters. 
 * 			It is recommended to use a password phrase.</ui-note>
 */
class Note extends UIElement {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		const note = this.innerHTML;
		if(note){
			this.innerHTML = `<p class="note">${this.innerHTML}</p>`; 
		} else {
			this.innerHTML = "";
		}
		
	}
	
}

/**
 * UI code component.
 * <p>
 * Renders pre-formatted code and attempts to add syntax highlighting.
 * @extends UIElement
 * @example <caption>JSON Code</caption>
 * <ui-code>
 * 	{ "user_id":"admin",
 *    "roles":["Administrator"]}
 * </ui-code>
 * @example <caption>YAML Code</caption>
 * <ui-code>
 *   user_id: admin
 *   roles:
 *   - Administrator
 * </ui-code>
 */
class Code extends UIElement {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		this.innerHTML= html `<code><pre>$${this.textContent}</pre></code>`;
		if(hljs){
			hljs.highlightBlock(this.querySelector('code'));
		}
	}
	
}

/**
 * UI form component.
 * <p>
 * The UI form component is the root element of an input form.
 * <strong>Important:</strong> <em>Only one UI form per view is supported.</em>
 * @extends UIElement
 * @example <caption>Declaration of a UI Form</caption>
 * <ui-form>
 *   <!-- UI form elements -->
 * </ui-form>	
 */
class Form extends UIElement {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		this.innerHTML = `<form>${this.innerHTML}</form>`;
	}
	
}

/**
 * Base class for all form elements.
 * @extends UIElement
 */
class FormElement extends UIElement{
	
	/**
	 * Returns the form element label. 
	 * The label is either read from the <code>label</code> attribute or 
	 * the <code>&lt;ui-label;&gt;</code> child element. 
	 * The attribute takes precedence over the child element if both exists.
	 * The label defaults to the UI element name if not specified.
	 * @returns {String} the label text.
	 */
	get label(){
		let label = this.getAttribute('label');
		if(label){
			return label;
		}
		label = this.querySelector('ui-label');
		if(label){
			return label.innerHTML;
		}
        if(this.innerHTML){
            return this.innerHTML;
        }
        return this.name;
	}
	
	/**
	 * Returns the form element note if any.
	 * The note is either read from the <code>note</code> attribute or 
	 * the <code>&lt;ui-note;&gt;</code> child element. 
	 * The attribute takes precedence over the child element if both exists.
	 * Defaults to an empty string if not specified.
	 * @returns {String} the note or an empty string if no note exists
	 */
	get note(){
		let note = this.getAttribute('note');
		if(note){
			return note;
		}
		note = this.querySelector('ui-note');
		if(note){
			return note.innerHTML;
		}
		return '';
	}
	
	/**
	 * Returns the title attribute of this element.
	 * Returns an empty string when no title was specified.
	 * @returns {String} the title text or an empty string if no title exists
	 */
	get title(){
		const title = this.getAttribute('title');
		if(title){
			return title;
		}
		return '';
	}
	
}

/**
 * UI group component.
 * <p>
 * A group components allows to group elements in order to render them as a field set.
 * Grouping related input elements improves the usability of complex forms.
 * @extends FormElement
 * @example <caption>UI Group to Configure Basic Authentication Credentials for Webhook Invocations</caption> 
 * <ui-group label="Basic Authentication">
 * 	 <ui-note>The provided credentials are not stored in plain-text in the credential vault.</ui-note>
 *   <ui-input name="user_id">
 * 		<ui-label>User</ui-label>
 * 		<ui-note>User to authenticate webhook invocation</ui-note>
 *   </ui-input>
 * 	 <ui-password name="password">
 * 		<ui-label>Password</ui-label>
 * 		<ui-note>Password to authenticate the webhook user</ui-note>
 * 	 </ui-password>
 * </ui-group>
 */
class Group extends FormElement {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		if(!this.querySelector("fieldset")){
			this.innerHTML = html `<fieldset>
								     <legend title="$${this.title}">${this.label}</legend>
								     ${this.innerHTML}
							       </fieldset>`;
		}
	}
}

/**
 * UI form actions component.
 * <p>
 * The UI form actions groups form actions.
 * @extends FormElement
 * @example <caption>Sample Declaration of Save and Remove Buttons</caption>
 * <ui-actions>
 *  <!-- Save all settings -->
 * 	<ui-button name="save-settings" label="Save settings" primary>
 *  <!-- Prompt to confirm that the entity shall be removed from the server -->
 *  <ui-link-button href="confirm-remove.html" name="remove-item" label="Remove">
 * </ui-actions>
 */
class Actions extends FormElement {
	
	/**
	 * Renders the form actions container DOM.
	 */
	renderDom(){
		this.innerHTML = `<div class="form-actions" style="margin-top: 10px">
							${this.innerHTML}
						  </div>`;
	}
}

/**
 * Base class for all control form elements, such as input fields, select boxes, radio buttons, checkboxes, textareas or buttons.
 * @extends FormElement 
 */
export class Control extends FormElement{
	
	/**
	 * Initializes this control by searching the parent component.
	 * @throws An error if no parent form element exists. 
	 */
	constructor(){
		super();
	}
	
	/**
	 * Returns the current view model.
	 * @returns {ViewModel} the current view model 
	 */
	get viewModel(){
		return this._view.viewModel;
	}
	
	/**
	 * Returns a string array with all scopes that are allowed to edit or execute this control.
	 * Returns an empty array if everyone is allowed to edit this control.
	 * @returns {Array } string 
	 */
	get scopesAllowed(){
		let scopes = this.getAttribute('scopesAllowed');
		if(!scopes && this.form){
			scopes = this.form.getAttribute('scopesAllowed');
		}
		if(scopes){
			return scopes.split(/\s+/g);
		}
		return [];
	}
	
	/**
	 * Returns whether this control is readonly.
	 * @see readonly
	 * @returns {boolean} <code>true</code> if this control is readonly, <code>false</code> otherwise.
	 */
	isReadonly(){
		return this.readonly === 'readonly' || this.isFlagSet('readonly');
	}
	
	/**
	 * Returns the readonly state of this control.
	 * <p>
	 * A control is readonly if explicitly declared <code>readonly</code>, or if
	 * the user has insufficient privileges.
	 * </p>
	 * @see scopesAllowed
	 * @returns {String} readonly if the control shall be rendered readonly, an empty string otherwise
	 */
	get readonly(){
		if(this.hasAttribute('readonly')){
			return 'readonly';
		}
		let scopes = this.scopesAllowed;
		let user  = UserContext.get();
		if(user.scopesIncludeOneOf(scopes)){
			return '';
		}
		return 'readonly';
	}
	
	/**
	 * Returns whether this control is disabled.
	 * @see disabled
	 * @returns {boolean} <code>true</code> if this control is disabled, <code>false</code> otherwise.
	 */
	isDisabled(){
		if(this.disabled === 'disabled' || this.isFlagSet('disabled')){
			return true;
		}
		
		let scopes = this.scopesAllowed;
		let user  = UserContext.get();
		if(user.scopesIncludeOneOf(scopes)){
			return '';
		}
		return true;
	}
	
	/**
	 * Returns the disabled state of this control.
	 * <p>
	 * A control is disabled if explicitly declared <code>disabled</code>, or if
	 * the user has insufficient privileges.
	 * </p>
	 * @see scopesAllowed
	 * @returns {String} disabled if the control shall be rendered disabled, an empty string otherwise
	 */
	get disabled(){
		if(this.isFlagSet('disabled')){
			return 'disabled';
		}
		const scopes = this.scopesAllowed;
		const user  = UserContext.get();
		if(user.scopesIncludeOneOf(scopes)){
			return '';
		}
		return 'disabled';
	}

	/**
	 * Returns the name of this control.
	 * @returns {String} the name of this control
	 */
	get name(){
		return this.getAttribute('name');
	}
	
	/**
	 * Returns view model binding of this control.
	 * The binding is a JSON path from the view model root to the property managed by this control. 
	 * The binding defaults to the control name if no binding was specified.
	 */
	get binding(){
		const binding = this.getAttribute('bind');
		if(binding){
			return binding;
		}
		return this.name;
		
	}
	
}

/**
 * UI link component.
 * <p>
 * Renders a link to the specified view if the view exists. 
 * Renders plain text if the view does not exist.
 * @extends UIElement
 * @see Section to render complete sections only if a specified view exists.
 * @example <caption>Link to an optional view</caption>
 * 	<ui-link href="/path/to/view.html" title="Open view">Go to view</ui-link>
 * 
 */
export class Link extends UIElement {
	
	constructor(){
		super();
	}
	
	renderDom(){
		if(!this._content){
			this._content = this.innerHTML;
		}
		const href = this.getAttribute('href');
		const location = new Location(href);
		Modules.selectModule(location.module)
			   .then((module) => module.viewExists(location))
			   .then(() => {this.innerHTML= html `<a href="$${href}" title="$${this.title}">${this._content}</a>`})
			   .catch(() => {this.innerHTML= this._content});
	}
	
}

/**
 * UI section component.
 * <p>
 * Renders a section only if all specified constraints are satisfied.
 * @extends UIElement
 * @example <caption>Render section when the specified view exists</caption>
 * 	<ui-section whenViewExists="/path/to/view.html">
 * 		...
 *  </ui-section>
 */

export class Section extends UIElement {
	constructor(){
		super();
	}
	
	renderDom(){
		if(!this._content){
			this._content = this.innerHTML;
		}
		const view = this.getAttribute('whenViewExists');
		const location = new Location(view);
		Modules.selectModule(location.module)
			   .then((module) => module.viewExists(location))
			   .then(() => {this.innerHTML=this._content})
			   .catch(() => {this.innerHTML=''});
	}
}


/**
 * Button UI component.
 * <p>
 * A button to perform a certain action like applying changes for example.
 * <p>
 * Three different button styles exist
 * <ul>
 * 	<li><em>primary</em>, the action that is mostly executed</li>
 *  <li><em>danger</em>, for actions that shall be executed with care</li>
 *  <li>the default button style, for all other buttons</li>
 * </ul>
 * Two button sizes exist, <em>small</em> or regular which is the default size.
 * <p>
 * A button behaves like a link if the <code>href</code> attribute is present and navigates to the specified path.
 * @extends Control
 * @example <caption>Declaration of Primary Button and Default Button</caption>
 * <ui-actions>    
 * 	 <!-- Add a new user -->
 * 	 <ui-button name="add_user" primary>Add user</ui-button>
 *   <!-- Move back to the users view if no user shall be added -->
 *   <ui-button href="users.html">Cancel</ui-button>.
 * </ui-actions>
 */
class Button extends Control {
	
	/**
	 * Returns the computed button size.
	 * <p>
	 * A button is small if the <code>small</code> attribute is present either without value or a value of <code>true</code>.
	 * If the <code>small</code> attribute is omitted, the button is displayed in its normal size. 
	 * </p>
	 * @return {String} the button size CSS class.
	 */
	get _buttonSize(){
		const small = this.getAttribute('small');
		if(small == '' || small == 'true'){
			return 'btn-sm';
		}
		return '';
	}
	

	/**
	 * Returns the computed button style.
	 * Three button styles exist as of today:
	 * <ul>
	 * 	<li><b>primary</b>, the action that is executed by default</li>
	 *  <li><b>danger</b>, an action that shall be executed with care</li>
	 *  <li>No explicit style for all other available actions.</li>
	 * </ul>
	 * The <em>danger</em> style is applied if the <code>danger</code> attribute is present either without value or a value of <code>true</code>.
	 * The <em>primary</em> style is applied if the <code>danger</code> attribute is present either without value of a value of <code>true</code>.
	 * The default button style is applied if none of the two attributes is present.
	 * Danger style takes precedence over primary style if both styles are enabled.
	 * 
	 * @return {String} the button style CSS class.
	 */
	get _buttonStyle(){
		const danger = this.getAttribute('danger');
		if(danger == '' && danger != 'false'){
			return 'btn-danger';
		}
		
		const primary = this.getAttribute('primary');
		if(primary == '' && primary != 'false'){
			return 'btn-primary';
		}

		return 'btn-outline';
	}
	
	/**
	 * Renders the DOM
	 */
	renderDom(){
		
		const condition = this.getAttribute('when');
		if(condition && !this.viewModel.getProperty(condition)){
			this.innerHTML='';
			this.outerHTML='';
			return;
		}
		
		const href = this.getAttribute('href');
		if(href && !this.disabled){ // Render button because disabled links are not supported
			const target = this.isFlagSet('external') ? 'target="_blank"' : '';
			
			this.outerHTML=html `<a id="${this.name}" 
			                        class="btn ${this._buttonSize} ${this._buttonStyle}" 
			                        title="$${this.title}" 
			                        href="$${href}" 
			                        ${target}>${this.label}</a>`;
		} else {
			this.outerHTML=html `<button id="${this.name}" 
			                             name="${this.name}" ${this.readonly} ${this.disabled}
			                             value="$${this.getAttribute('value')}"
			                             class="btn ${this._buttonSize} ${this._buttonStyle}" 
			                             title="$${this.title}">${this.label}</button>`;
		}
	}
}


/**
 * Base class for all input controls.
 * @extends Control
 */
export class InputControl extends Control {
	
	
	/**
	 * Returns the current value of this control.
	 * <p>
	 * First, the value is read from the view model using the configured binding.
	 * If no value is present in the view model, the value is read from the <code>value</code> attribute.
	 * If no value attribute exists either, the value defaults to an empty string.
	 * </p>
	 * @return {String} the current value of this input control.
	 */
	get value(){
		try{
			const path = this.binding;
			// Lookup specified model property.
			const model = this.viewModel.getProperty(path);
			if(model){
				return model;
			}
	
			const value = this.getAttribute('value');
			if(value){
				// Set initial value if value not already present in view model
				this.viewModel.setProperty(path,value);
				return value;
			}
			// No value specified. Use '' instead of null
			return '';
		} catch (e){
			console.log(e);
			return '';
		}
	}
	
	/**
	 * Updates the view model property bound to this control.
	 * @param {string|number|boolean} value the new property value 
	 */
	set value(value){
		const transient = this.getAttribute('transient');
		if(transient == '' || transient=='true'){
			// Ignore transient attributes.
			return;
		}
		
		let path = this.getAttribute('bind');
		if(!path){
			path = this.name;
		}
		this.viewModel.setProperty(path,value);
	}
	
	
	/**
	 * Returns the placeholder text.
	 * <p>
	 * The placeholder text is displayed in the input control and explains what data the user is supposed to enter.
	 * Typically a placeholder describes a format or provides some sample data.
	 * Returns an empty string if no placeholder attribute was specified.
	 * </p>
	 * @returns {String} the placeholder text or an empty string if no placeholder text was specified.
	 */
	get placeholder(){
		const placeholder =  this.getAttribute('placeholder');
		if(placeholder){
			return placeholder;
		}
		return '';
	}
	
}

/**
 * Text input field.
 * @extends InputControl
 * @example <caption>Input Element Without Note</caption>
 * <ui-input name="user_id" label="User ID"> 
 * @example <caption>Input Element With Note Attribute</caption>
 * <ui-input name="user_id" label="User ID" note="Unique user account login ID"> 
 * @example <caption>Input Element With Label and Note Child Element</caption>
 * <ui-input name="user_id">
 * 	<ui-label>User ID</ui-label>
 * 	<ui-note><em>Unique</em> user account login ID</ui-note>
 * </ui-input>
 * @example <caption>Input Element With Alternate Attribute Binding</caption>
 * <ui-input name="user_id" bind="user_name" label="User Name">
 * 	<ui-note>Unique user account login ID</ui-note>
 * </ui-input>
 */
class InputText extends InputControl {
	
	/**
	 * Renders the DOM
	 */
	renderDom(){
		// Search for buttons to be displayed next to the input field.
		let buttons = [...this.querySelectorAll('ui-button')];
		const copy = this.querySelector('ui-copy');
		if(copy){
			buttons = buttons.concat(copy);
		}
		
		this.innerHTML=html `<div class="form-group">
		                       <div class="label">
    		                     <label for="${this.name}">${this.label}</label>
    		                   </div>
    		                   <div class="input">
    		                     <input id="${this.name}" 
                                        type="text" ${this.readonly} ${this.disabled}
                                        class="form-control" 
                                        name="${this.name}" 
                                        value="$${this.value}" 
                                        placeholder="$${this.placeholder}">							
                                        ${[...buttons].map(button => button.outerHTML).reduce((a,b)=>a+b,'')}
    				           </div>
    		                   ${this.note ? `<p class="note">${this.note}</p>` : ''}
						     </div>`;
		this.addEventListener("change",function(evt){
			this.viewModel.setProperty(this.binding,evt.target.value);
		}.bind(this));
	}

}


/**
 * Number input field
 * @extends InputControl
 * @example <caption>Number Input Element With Label and Note</caption>
 * <ui-number name="port">
 * 	<ui-label>Port</ui-label>
 * 	<ui-note>The network port number</ui-note>
 * </ui-number>
 * @example <caption>Input Element With Alternate Attribute Binding</caption>
 * <ui-number name="port" bind="network_settings.port">
 * 	<ui-label>Port</ui-label>
 * 	<ui-note>The network port number</ui-note>
 * </ui-number>
 */
class InputNumber extends InputControl {
	
	/**
	 * Renders the DOM
	 */
	renderDom(){
		this.innerHTML=html `<div class="form-group">
						       <div class="label">
						         <label for="${this.name}">${this.label}</label>
						       </div>
						       <div class="input">
						         <input id="${this.name}" 
						                type="number" ${this.readonly} ${this.disabled} 
						                inputmode="numeric" 
						                pattern="[0-9]*" 
						                class="form-control" 
						                name="${this.name}" 
						                value="$${this.value}" 
						                placeholder="$${this.placeholder}">
						       </div>
                               ${this.note ? `<p class="note">${this.note}</p>` : ''}
						     </div>`;
		this.addEventListener("change",function(evt){
			this.viewModel.setProperty(this.binding,evt.target.value);
		}.bind(this));
	}

}

/**
 * Password input field
 * <p>
 * The password input field has the same semantics as the input field except that the entered value is not displayed.
 * @see Input
 * @extends InputControl
 * @example <caption>Password Input Element</caption> 
 * <ui-password name="password">
 * 	<ui-label>Password</ui-label>
 *  <ui-note>Use a password phrase to create a password that is hard to guess but easy to be memorized</ui-note>
 * </ui-password>
 */
class Password extends InputControl {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		this.innerHTML=html `<div class="form-group">
			                   <div class="label">
			                     <label for="${this.name}">${this.label}</label>
			                   </div>
			                   <div class="input">
			                     <input id="${this.name}" 
			                            type="password" ${this.readonly} ${this.disabled} 
			                            class="form-control" 
			                            name="${this.name}" 
			                            value="$${this.value}" 
			                            placeholder="$${this.placeholder}">
			                   </div>
		                       ${this.note ? `<p class="note">${this.note}</p>` : ''}
			                </div>`;
		this.addEventListener("change",function(evt){
			this.viewModel.setProperty(this.binding,evt.target.value);
		}.bind(this));
	}
}

/**
 * Textarea UI component.
 * <p>
 * The textarea has the same semantics as the input field except that is rendered as texarea to enter larger texts.
 * @extends InputControl
 * @example <caption>Textarea With Note Element</caption>
 * <ui-textarea name="description" label="Description">
 *   <ui-note>A brief description of this entity</ui-note>
 * </ui-textarea>
 */
class Textarea extends InputControl {

	/**
	 * Renders the DOM.
	 */
	renderDom(){
		this.innerHTML=html `<div class="form-group">
						       <div class="label">
						         <label for="${this.name}">${this.label}</label>
						       </div>
						       <div class="input">
						         <textarea id="${this.name}" 
						                   type="text" ${this.readonly} ${this.disabled}
						                   class="form-control" 
						                   name="${this.name}">$${this.value}</textarea>
						       </div>
                               ${this.note ? `<p class="note">${this.note}</p>` : ''}
						    </div>`;
		this.addEventListener("change",function(evt){
			this.viewModel.setProperty(this.binding,evt.target.value);
		}.bind(this));
	}
}

/**
 * Select box UI component.
 * <p>
 * The select box displays a list of options the user can select from.
 * <p>
 * The options are read from the view model. 
 * The path to the options array is set in the <code>options</code> attribute.
 * The view model must provide an array of objects each representing a single option.
 * Each option consists of up to three properties, the <code>value</code> property,  
 * an optional <code>label</code> property that defaults to the <code>value</code> property if omitted, 
 * and an optional boolean <code>default</code> property to declare the default option.
 * </p>
 * If no options attribute exists, the options are supposed to be specified in the <code>&lt;ui-select&gt;</code> body.
 * @extends InputControl 
 * @example <caption>Select Box with Note and Static Options</caption>
 * <ui-select name="unit">
 *   <ui-note>Select the unit of the configured session expiration interval.</ui-note>
 *   <ui-option value="s">Seconds</ui-option>
 *   <ui-option value="m">Minutes</ui-option>
 *   <ui-option value="h">Hours</ui-option>
 *   <ui-option value="d">Days</ui-option>
 * </ui-select>
 * @example <caption>Select Box with Note and Options Attribute</caption>
 * <ui-select name="element_role" options="element_role_list">
 *   <ui-note>The element role in the network</ui-note>
 * </ui-select>
 */
export class Select extends InputControl {

	/**
	 * Reads all options from either the view model by either
	 * resolving the JSON path set in the <code>options</code> attribute or by
	 * reading the <code>&lt;ui-option&gt;</code> elements in case no options exist in the view model
	 * @returns {String} option list in HTML format
	 */
	get _options(){
		const binding = this.getAttribute('options');
		let options = this.viewModel.getProperty(binding);
		
		if(!options){
			options = [];
			this.querySelectorAll('ui-option')
				.forEach(option => options.push({'value':option.getAttribute('value'),
												 'label':option.innerHTML,
												 'default':(option.getAttribute('default') == '' || option.getAttribute('default') == 'true')}));
		}
		return options;
	}
	
	/**
	 * Tests whether the given option is currently selected.
	 * @param {String} option.value the option value
	 * @param {String} [option.label] the option label
	 * @param {boolean} [option.default] a flag indicating whether the option is the default option.
	 * @returns {boolean} <code>true</code> if the option is currently selected, <code>false</code> otherwise.
	 */
	isSelected(option){
		return (this.viewModel.test(this.binding,option.value) || !this.viewModel.contains(this.binding) && option['default']);
	}
	
	/**
	 * Selects the option with the given value.
	 * @param {String} option the option value
	 */
	select(option){
		this.value=option;
	}
	
	options(){
		return Promise.resolve(this._options);
	}
	
	get multiple(){
		return this.isFlagSet('multiple')
	}
	
	get selected(){
		const select = this.querySelector('select');
		const options = select.selectedOptions;
		if(this.multiple){
			return options;
		}
		if(options.length > 0){
			return options[0];
		}	
		return null;
	}
	
	/**
	 * Renders the select box DOM.
	 */
	renderDom(){
		const label = this.label;
		const name = this.name;
		const note = this.note;
	    // Search for buttons to be displayed next to the input field.
        const buttons = this.querySelectorAll('ui-button');

		this.options()
			.then((options) => {
			    if(this.noOptions && (!options || !options.length)){
			        this.noOptions();
			        return;
			    }
			    
			    const size = this.multiple ? Math.max(2,options.length) : 1;
				const optionsHtml = options.map(option => html `<option value="$${option.value}" ${this.isSelected(option) ? 'selected' : ''}>$${option.label || option.value}</option>`)
										   .reduce((a,b) => a+b,'');
				this.innerHTML=html `<div class="form-group">
									   <div class="label">
									     <label for="${name}">${label}</label></div>
									   <div class="input">
									     <select id="${name}" 
									             class="${size == 1 ? 'form-select' : 'form-control'}" ${this.readonly} ${this.disabled} 
									             name="${this.name}" 
									             ${this.multiple ? "multiple" : ""} 
									             size="${size}">${optionsHtml}</select>
									     ${[...buttons].map(button => button.outerHTML).reduce((a,b)=>a+b,'')}
									   </div>
				                       ${this.note ? this.note : ''}
								     </div>`;
			
				this.addEventListener('change',(evt) => {
					this.select(evt.target.value);
				});
				
				if(this.form){
				    this.form.addEventListener('UIPreExecuteAction',(evt) => {
				        const select = this.querySelector('select');
				        const options = select.selectedOptions;
				        if(this.multiple){
				            this.select([...options].map(option => option.value));
				            return;
				        }
				        if(options.length > 0){
				            this.select(options[0].value);
				        } else {
				            this.select(null);
				        }
				        
				    });
				}
			});
	}
	
}

/**
 * Radio button control.
 * <p>
 * Radio buttons also represent a set of options a user can select from. 
 * The key difference to a select box is that a radio option can provide more details on each option.
 * @extends InputControl
 * @example <caption>Radio Buttons to Select Webhook Authentication Mode</code>
 * <ui-group label="Authentication Mode">
 *   <ui-radio name="auth_mode" value="basic" label="Basic Authentication">
 * 	   <ui-note>HTTP Basic Authentication</ui-note>
 *   </ui-radio>
 *   <ui-radio name="auth_mode" value="bearer" label="Bearer Token">
 * 	  <ui-note>Bearer Token Authentication</ui-note>
 *   </ui-radio>
 *   <ui-radio name="auth_mode" value="none" label="None" default>
 * 	  <ui-note>Invoke webhook unauthenticated</ui-note>
 *   </ui-radio>
 *  </ui-group>
 */
class RadioButton extends InputControl {
	
	/** 
	 * Renders the DOM.
	 */
	renderDom(){
	    
		const value = this.getAttribute('value');
		const checkedByDefault = this.isFlagSet('default');
		const checked = (this.viewModel.contains(this.binding) && this.viewModel.test(this.binding,value) || !this.viewModel.contains(this.binding) && checkedByDefault ) ? 'checked' : '';
        let conditional = this.querySelector('ui-checked');

        this.innerHTML= html `<div class="form-checkbox">
                                <label>
                                  <input type="radio" 
                                         class="form-control" ${this.readonly} ${this.disabled}
                                         name="${this.name}"
                                         value="$${value}" 
                                         ${checked}>${this.label}
                                  <p class="note">${this.note}</p>
                                </label> 
                              </div>`;
        
        if(conditional) {
            const container = document.createElement("ui-element");
            container.innerHTML = conditional.innerHTML;
            container.when = () => {
                return this.viewModel.test(this.name,value);
            };
            this.querySelector('div').appendChild(container);
        }

        
        
        
        this.addEventListener('change',(evt) => {
            if(evt.target.name==this.name){
                this.viewModel.setProperty(this.binding,evt.target.value);
                this.form.dispatchEvent(new CustomEvent('UIViewModelUpdate'));
            }
        });
	}

}

/**
 * Checkbox control.
 * <p>
 * A checkbox represent an option a user can either enable or disable.
 * If the checkbox is checked, i.e. the option is enabled, a property is added to the view model.
 * The property JSON path is read from the <code>bind</code> or <code>name</code> attribute if no binding was specified.
 * The property value is read from the <code>value</code> attribute. 
 * A checkbox is checked by default if the <code>checked</code> attribute is present either without value or a value of <code>true</code>.
 * @example <caption>Canary Option Disabled by Default</caption>
 * <ui-checkbox name="canary" value="true">
 * 	<ui-label>Enable Canary Deployment</ui-label>
 * 	<ui-note>Enable canary deployment to suspended the upgrade after the first execution of a task to wait for a manual confirmation that the task has succeeded.</ui-note>
 * </ui-checkbox>
 * @example <caption>Canary Option Enabled by Default</caption>
 * <ui-checkbox name="canary" value="true" checked>
 * 	<ui-label>Enable Canary Deployment</ui-label>
 * 	<ui-note>Enable canary deployment to suspended the upgrade after the first execution of a task to wait for a manual confirmation that the task has succeeded.</ui-note>
 * </ui-checkbox>  
 * @extends InputControl
 */
class Checkbox extends InputControl {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		function typedValue(value){
			if(value === 'true'){
				return true;
			} 
			if(value === 'false'){
				return false;
			}
			if(isNaN(value)){
				return value;
			}
			if(Number.isInteger(value)){
				return Number.parseInt(value);
			}
			return Number.parseFloat(value);
		}
		
		
		const value = this.getAttribute('value');
		const checkedByDefault = this.isFlagSet('checked');
		const checked = (this.viewModel.test(this.binding,typedValue(value)) || !this.viewModel.contains(this.binding) && checkedByDefault ) ? 'checked' : '';
		let conditional = this.querySelector('ui-checked');
		if(conditional) {
			let condition = this.getAttribute('when');
			if(!condition){
				condition = this.binding;
			}
			conditional = `<ui-element when="${condition}">${conditional.innerHTML}</ui-element>`;
		}
		this.innerHTML= html `<div class="form-checkbox">
						        <label>
						          <input type="checkbox" 
						                 class="form-control" ${this.readonly} ${this.disabled}
						                 name="${this.name}"
						                 value="$${value}" 
						                 ${checked}>${this.label}
						          <p class="note">${this.note}</p>
						        </label> 
						        ${conditional||''}
						      </div>`;
		
		this.querySelector('.form-checkbox label').addEventListener('change',(evt) => {
			const checkboxes = document.querySelectorAll(`input[name='${this.name}']`);
			if(checkboxes.length > 1){
				//Multivalue field
				const values = [...checkboxes].filter(checkbox => checkbox.checked).map(checkbox => typedValue(checkbox.value));
				this.viewModel.setProperty(this.binding,values);
			} else {
				if(evt.target.checked){
					this.viewModel.setProperty(this.binding,typedValue(evt.target.value));
				} else {
					const value = typedValue(evt.target.value);
					if(value === true){
						this.viewModel.setProperty(this.binding,false);
					} else if(value === false){
						this.viewModel.setProperty(this.binding,true);
					} else {
						this.viewModel.removeProperty(this.binding);
					}
				}
			}
		});
	}
}

/**
 * Blankslate UI component.
 * <p>
 * A blank slate displays that an entity does not exist or a collection is empty.
 * The blank slate itself consists of a title and a note which typically provides details on how to add the missing information.
 * The optional <code>bind</code> attribute states which view model property must be absent, <code>null</code> or empty to display 
 * the blank slate. The blankslate is always displayed when the <code>bind</code> attribute is omitted.
 * </p>
 * @example <caption>Blank Slate No Pods Found</caption>
 * 	<ui-blankslate>
 * 	  <ui-title>No pods found</ui-title>
 * 	  <ui-note>No pods match the given filter.</ui-note> 
 *  </ui-blankslate>
 * @example <caption>Blank Slate Bound to <code>pods</code> Attribute</caption>
 *  <ui-blankslate bind="pods">
 * 	  <ui-title>No pods found</ui-title>
 * 	  <ui-note>No pods match the given filter.</ui-note> 
 *  </ui-blankslate>
 * @extends UIElement
 */
class Blankslate extends UIElement {
	
	/**
	 * Renders the blank slate DOM.
	 */
	renderDom(){
		const bind  = this.getAttribute('bind');
		if(!bind || !this.viewModel.getProperty(bind) || this.viewModel.getProperty(bind).length === 0){
			const title = this.querySelector('ui-title').innerHTML;
			const note = this.querySelector('ui-note').innerHTML;
			this.innerHTML = `<div class="blankslate">
				                <h4>${title}</h4>
				                <ui-note>${note}</ui-note>
				              </div>`;
		}
	}
}

/**
 * Composition UI component.
 * <p>
 * The composition UI component arranges input controls side-by-side rather than row-wise.
 * Each input control must be wrapped by an <code>&lt;ui-item&gt;</code> element.
 * The size of an item is adjusted automatically, unless the <code>size</code> attribute is present.
 * The size is expressed as relative value of the available width and is either 
 * <code>one-fifth</code>,<code>one-fourth</code>, <code>one-third</code>, <code>one-half</code>, or <code>two-thirds</code>.
 * @example <caption>Composition With Auto-Sizing</caption>
 * <ui-composition>
 *  <ui-item>
 *    <ui-select name="comparator" options="comparators">
 *      <ui-label>Compare Function</ui-label>
 *    </ui-select>
 *  </ui-item>
 *  <ui-item>
 *    <ui-input name="threshold">
 *    	<ui-label>Threshold</ui-label>
 *    </ui-input>
 *  </ui-item>
 * </ui-composition>
 * @example <caption>Composition With Explicit Sizing</caption>
  * <ui-composition>
 *  <ui-item size="one-third">
 *    <ui-select name="comparator" options="comparators">
 *      <ui-label>Compare Function</ui-label>
 *    </ui-select>
 *  </ui-item>
 *  <ui-item>
 *    <ui-input name="threshold">
 *    	<ui-label>Threshold</ui-label>
 *    </ui-input>
 *  </ui-item>
 * </ui-composition>
 * @extends UIElement
 */
class Composition extends UIElement {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		const items = this.querySelectorAll('ui-item');
		const size = function(item){
			const size = item.getAttribute('size');
			if(size){
				return size;
			}
			return ''
		};
		const cells = [...items].map(item => `<div class="column ${size(item)}">${item.innerHTML}</div>`).reduce((a,b)=>a+b,'');
		this.innerHTML=`<div class="row">
						  ${cells}
						</div>`;
	}
	
	
}

/**
 * Filter component.
 * <p>
 * The filter component simplifies adding a filter to a list view.
 * </p>
 * The filter is formed by an input field, a button to apply the filter, an optional note to explain how to use the filter, and optional advanced filtering options.
 * The filter renders the controls to show or hide the advanced filtering options if advanced filtering options exist.
 * @example <caption>Filter Without Advanced Filtering Options</caption>
 * <ui-filter name="filter">
 * 	<ui-label>Filter</ui-label>
 *  <ui-note>Filter configurations by their name</ui-note>
 * </ui-filter>
 * @example <caption>Filter With Advanced Filtering Options </caption>
 * <ui-filter name="filter" bind="query.filter" placeholder="Enter a filter query">
 * <ui-label>Filter</ui-label>
 *   <ui-note>Filter events by their messages and all other fields. Use a colon (:) as delimiter for field name and value.</ui-note>
 *   <ui-options>
 *     <ui-select name="severity" bind="query.severity" options="severities">
 *       <ui-label>Severity</ui-label>
 *       <ui-note>Select the lowest severity to be displayed</ui-note>
 *     </ui-select>
 *     <ui-select name="range" bind="query.range" options="ranges">
 *       <ui-label>Time Range</ui-label>
 *       <ui-note>Select the time range to search for events</ui-note>
 *     </ui-select>
 *     <ui-checkbox name="after" value="true" bind="query.filter_after" when="timerange">
 *       <ui-label>Search for events issued after <ui-date name="after" bind="query.after">{{query.after}}</ui-date></ui-label>
 *       <ui-note>All events issued before the selected date will not be displayed.</ui-note>
 *     </ui-checkbox>
 *     <ui-checkbox name="before" value="true" bind="query.filter_before" when="timerange">
 *       <ui-label>Search for events issued before <ui-date name="before" bind="query.before">{{query.before}}</ui-date></ui-label>
 *       <ui-note>All events issued after the selected date will not be displayed.</ui-note>
 *     </ui-checkbox>				
 *   <ui-options>
 * </ui-filter>
 * @extends InputControl
 */
export class Filter extends InputControl {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		let note = this.querySelector('ui-note');
		note = note ? note.innerHTML : '';
		let options = this.querySelector('ui-options');
		let autofocus = 'autofocus';
		if(options){
			note += `<a href="#" name="show_options" title="Show advanced filter options">Show advanced filtering options</a>
					 <a href="#" name="hide_options" class="hidden" title="Hide advanced filter options">Hide advanced filtering options</a>`;
			
			options=`<ui-group label="Options" class="hidden">
				       ${options.innerHTML}
				     </ui-group>`;
		}
		
		
		this.innerHTML = html `<div class="form-group">
						  	     <div class="label">
						  		   <label for="${this.name}">${this.label}</label>
						  	     </div>
						  	     <div class="input">
						  		   <input id="${this.name}" 
						  		          type="text" 
						  		          class="form-control" ${this.readonly} ${this.disabled} ${autofocus} 
						  		          name="${this.name}" 
						  		           value="$${this.value}" placeholder="$${this.placeholder}">
						  		   <button name="filter" class="btn btn-outline">Filter</button>
						  	     </div>
						  	     <ui-note>${note}</ui-note>
						       </div>
						       ${options||''}`;

		this.addEventListener("change",(evt) => {
			if(evt.target.name==this.name){
				this.viewModel.setProperty(this.binding,evt.target.value);
			}
		});
		
		// Add controls to show / hide advanced filtering options.
		this.addEventListener('click',(evt) => {
			const name = evt.target.name;
			if(name == 'show_options' || name == 'hide_options'){
				const show = this.querySelector("a[name='show_options']");
				const hide = this.querySelector("a[name='hide_options']");
				const group = this.querySelector('ui-group');
				if(name == 'show_options'){
					group.classList.remove('hidden');
					show.classList.add('hidden');
					hide.classList.remove('hidden');
				} else {
					group.classList.add('hidden');
					show.classList.remove('hidden');
					hide.classList.add('hidden');
				}
				evt.stopPropagation();
				evt.preventDefault();
			}
		});
		
	}
	
	
}

/**
 * Object details component.
 * <p>
 * The <code>&lt;ui-details&gt;</code> component is used to display the properties of an object as table.
 * Each property to be displayed is represented by a <code>&lt;ui-property&gt;</code> element, which in turn
 * contains a <code>&lt;ui-label&gt;</code> and <code>&lt;ui-value&gt;</code> element.
 * </p>
 * @example <caption>Task Details</caption>
 * <ui-details>
 *   <ui-property>
 *     <ui-label>Task Type</ui-label>
 *     <ui-value>{{task_type}}</ui-value>
 *   </ui-property>
 *   <ui-property>
 *     <ui-label>Task Name</ui-label>
 *     <ui-value>{{task_name}}</ui-value>
 *   </ui-property>
 *   <ui-property>
 *     <ui-label>Task State</ui-label>
 *     <ui-value><span class="extra-small {{task_state}}">{{task_state}}</ui-value>
 *   </ui-property>
 * </ui-details>
 * @extends UIElement
 */
class Details extends UIElement {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		if(this.hasAttribute('class')){
			this.classList.add(this.getAttribute('class'));
		}
		const properties = this.querySelectorAll('ui-property');
		const table = `<table class="details">
						${[...properties]
						   .map(property => {
									const label = property.querySelector('ui-label').innerHTML;
									const valueTag = property.querySelector('ui-value');
									let value = valueTag.innerHTML.trim();
									if(!value){
										value = valueTag.getAttribute("default");
									}
									if(value){
										return html `<tr><th class="text top">${label}</th><td>${value}</td></tr>`;
									}
									return '';
								})
							.reduce((a,b) => a+b,'')}
						</table>`;
		this.innerHTML=table;
	}
	
}


/**
 * Confirm dialog component.
 * <p>
 * The confirm dialog asks the user to confirm the execution of an action or to cancel the operation.
 * The confirm dialog consists of a title, a message that describes the action the user should confirm, an approve button, and a decline button
 * </p>
 * @extends UIElement
 * @example <caption>Confirm Box With Option</caption>
 * <ui-confirm scopesAllowed="Operator">
 *  <ui-title>Confirm to remove metric {{metric_name}}</ui-title>
 *  <ui-message>
 *    <ui-note>
 *      Removing a metric <strong>cannot be undone!</strong>
 *      A metric must be restored manually after being removed.
 *    </ui-note>
 *    <ui-checkbox name="force" value="true">
 *      <ui-label>Remove metric bindings</ui-label>
 *      <ui-note>Remove all existing metric bindings. 
 *               Only unbound metrics can be removed by default.
 *               A metric is bound if the metric is supplied by at least one element.
 *      </ui-note>
 *    </ui-checkbox>
 *  </ui-message>
 *  <ui-approve name="confirm-remove">Confirm</ui-approve>
 *  <ui-decline href="metric.html?metric={{metric_name}}">Cancel</ui-decline>
 * </ui-confirm>
 */
class ConfirmDialog extends UIElement {
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		const header = this.querySelector('ui-title').innerHTML;
		const note = this.querySelector('ui-message').innerHTML;
		const confirm = this.querySelector('ui-approve');
		const decline = this.querySelector('ui-decline');
		const scopesAllowed = this.getAttribute('scopesAllowed');
		
		this.innerHTML=`<div class="confirm">
						  <ui-form>
						    <h2>${header}</h2>
						    <div>${note}</div>
						    <ui-actions>
						      <ui-button danger name="${confirm.getAttribute('name')}" scopesAllowed="${scopesAllowed||''}">${confirm.innerHTML}</ui-button>
					    	  <ui-button href="${decline.getAttribute('href')}">${decline.innerHTML}</ui-button>
						    </ui-actions>
						  </ui-form>
						</div>`;
	}
	
}


class MainMenu extends HTMLElement {
	
	connectedCallback(){
		const render = function(menu){
		    const user = UserContext.get();
			return  html `<header class="header">
						    <nav class="main" style="positon:relative;">
							  <a class="btn btn-sm right" 
							     href="/api/v1/logout">
							     Logout</a>
							  ${menu.filter(item => user.scopesIncludeOneOf(item.scopes_allowed)) 
							        .map(item => html `<a class="main-menu-item ${item.position ? item.position : ''}" 
												          href="/ui/views${item.path}" 
												          title="${item.subtitle}" 
												          data-title="$${item.title}" 
												          data-module="${item.module}">
												          $${item.label}</a>`)
								  .reduce((a,b)=>a+b,'')}
								<label for="go">Search:</label>
								<span style="position:relative">
								<input id="go" class="form-control" type="text" name="gsearch"></input>
					 	    		<div class="instructions">
										<pre><b>e</b>lement<b>: </b><i>name</i> | <i>alias</i></pre>
										<span class="note">Search for elements by name or alias.</span>
										<pre><b>host: </b><i>hostname</i> | <i>IP address</i></pre>
										<span class="note">Search for elements by hostname or management IP address.</span>
										<pre><b>mac: </b><i>MAC address</i></pre> 
										<span class="note">Search for elements by MAC address.</span>
										<pre><b>sn: </b><i>serial number</i></pre>
										<span class="note">Search for elements by serial number.</span>
										<pre><b>p</b>od<b>: </b><i>name</i></pre>
										<span class="note">Search for pods by name.</span>
										<pre><b>m</b>etric<b>: </b><i>name</i> | <i>display name</i></pre>
										<span class="note">Search for metrics by name or display name.</span>
										<pre><b>f</b>acility<b>: </b><i>name</i></pre> 
										<span class="note">Search for facilities by name.</span>
										<pre><b>i</b>mage<b>: </b><i>uuid</i></pre>
										<span class="note">Lookup image by image ID.</span>
										<pre><b>j</b>ob<b>: </b><i>uuid</i></pre> 
										<span class="note">Lookup job by job ID.</span>
										<p class="note"><b>Hint:</b> Press the <span class="key">s</span> key to quickly access this search function.</p>
									</div>
					 	    	</span>
					 	    </nav>
						</header>
			            <ui-module-container>
			                <!-- Module content ... -->
			            </ui-module-container>
					 `;
		};
		
		const loader = new Json('/api/v1/ui/modules');
		
		loader.load()
			  .then((menu) => {
				  this.innerHTML = render(menu);
				 	const header = this.querySelector("header");
				 	const input = header.querySelector("input");
				 	const instructions = header.querySelector(".instructions")
 					document.addEventListener("keyup",(evt) => {
						if (evt.target.nodeName != "INPUT" && evt.target.nodeName != "TEXTAREA" && evt.target.nodeName != "SELECT" && evt.code=="KeyS"){
							input.focus();						
						}
					});
				
				 	input.addEventListener("blur", (evt) => {
						instructions.style.display="none";
					});
					input.addEventListener("focus", (evt) => {
						instructions.style.display="block";
					});
							
				 	header.addEventListener("keyup",(evt)=>{
						const v = this.querySelector("#go").value;
						if (evt.code == "Enter"){
						const d = v.indexOf(":")
						let p = "e";
						if (d > 0){
						 	p =v.substring(0,d)
						}
						const q = v.substring(d+1).trim();
						let target = ""
						switch(p.toLowerCase()){
							case "facility":
							case "f":{
								target=`/ui/views/inventory/facility/facilities.html?filter=${q}`
								break;
							}
							case "pod":
							case "p":
							case "group":
							case "g":{
								target=`/ui/views/inventory/pods.html?filter=${q}`
								break;
							}
							case "serial":
							case "serialnumber":
							case "sn":{
								target=`/ui/views/inventory/elements.html?filter=${q}&by=serial`
								break;
							}
							case "ip":
							case "host":{
								target=`/ui/views/inventory/elements.html?filter=${q}&by=ip`
								break;
							}
							case "image":
							case "i":{
								target=`/ui/views/image/image-meta.html?image=${q}`
								break;
							}
							case "job":
							case "j":{
								target=`/ui/views/job/tasks.html?job=${q}`
								break;
							}
							case "metric":
							case "m":{
								target=`/ui/views/metrics/metrics.html?filter=${q}`
								break;
							}
							case "element":
							case "e":
							default: {
								target=`/ui/views/inventory/elements.html?filter=${q}&by=tag`
							}
						}
						router.navigate(new Location(target));
						}
					});
				  router.navigate(new Location(window.location.href));
			  })
			  .catch((e) => {
				  console.error("Cannot create Leistand main menu.");
				  console.log(e);
				  router.redirect('/ui/login/login.html');
			  });
	}
	
	openModule(module){
	    const template = module.template;
	    const menus = module.computeMenuViewModel({},
	                                              menu => !menu.category || menu.category == 'module');
	    this.querySelector("ui-module-container").innerHTML=Mustache.to_html(module.template,menus);
	}
	
	select(tab){	
		const selected = document.querySelector("nav.main a[class~='selected']");
		const select = document.querySelector(`nav.main a[data-module='${tab}']`);
	
		if(selected == select){
			return false; // No changes needed.
		}
	
		if (selected) {
			selected.classList.remove("selected");
			selected.setAttribute("aria-selected","false");
		}
	
		select.classList.add("selected");
		select.setAttribute("aria-selected","true");
		return true;
	}

}

class ModuleContainer extends HTMLElement {
	
	connectedCallback(){
		this.addEventListener('UIRenderMenu', evt => {
			const module = evt.detail.module;
            const menus = module.computeMenuViewModel(evt.detail.viewModel,
                                                      menu => !menu.category || menu.category == 'module');
            
            if(evt.detail.renderView){
                this.innerHTML=Mustache.to_html(module.template,{"menus":menus,
                                                                 "multipleChoices": function(){
                                                                    const sel = menus.filter(m => m.selected);
                                                                    return sel.length > 1  || sel.length == 1 && sel[0].items.length >1 ;
                                                                 }});
                const moduleMenu = this.querySelector('ui-module-menu');
                if(moduleMenu){
                    moduleMenu.render(menus);
                }
                const viewTitle = this.querySelector('ui-view-title');
                if(viewTitle){
                    viewTitle.render(menus);
                }
                const viewMenu = this.querySelector('ui-view-menu');
    			if(viewMenu){
    				viewMenu.render(menus);
    				module.select(evt.detail.location);
    			}
    			const view = this.querySelector('ui-view');
    			view.renderView(evt.detail);
			} else {
                const moduleMenu = this.querySelector('ui-module-menu');
                if(moduleMenu){
                    moduleMenu.render(menus);
                }
                const viewTitle = this.querySelector('ui-view-title');
                if(viewTitle){
                    viewTitle.render(menus);
                }
                
                const viewMenu = this.querySelector('ui-view-menu');
                if(viewMenu){
                    viewMenu.render(menus);
                    module.select(evt.detail.location);
                }
			}

		});
	}
}


/**
 * Module menu component.
 * <p>
 * The <code>&lt;ui-module-menu&gt;</code> component renders the module menus as list of menus.
 * @extends HTMLElement
 * @example <caption>Render module menus</caption>
 *   <ui-module-menu></ui-module-menu>
 *   
 */
class ModuleMenu extends HTMLElement {

    constructor(){
        super();
        this.addEventListener('mouseover', (evt) => {
            if(evt.target.classList.contains("entity") || evt.target.parentNode.classList.contains("entity")){
                return;
            } 
            if(!this._fadedOut){
                document.querySelector("ui-view").style.opacity="0.33";
                const menu = document.querySelector("ui-view-menu");
                if(menu){
                    menu.style.opacity="0.33"
                }
                this._fadedOut = true;
            }
        });
        this.addEventListener('mouseout', (evt) => {
            if(this._fadedOut){
                document.querySelector("ui-view").style.opacity="1";
                const menu = document.querySelector("ui-view-menu");
                if(menu){
                    menu.style.opacity="1"
                }                
                this._fadedOut = false;
            }
        });
    }
    
    render(menus){
        const concat = (a,b) => a+b;
        const item2html = function(item){
            return html `<li><a class="menu-item" id="${item.view}" title="${item.title}" href="${item.viewpath}" ${item.target ? `target="${item.target}"` :''}>${item.label}</a></li>`;
        };
        let menuDom = menus.filter((menu) => !menu.selected)
                           .map((menu) => `<div class="popup_menu">    
                                             ${menu.items.length > 1 
                                             ? html `<h4 class="chevron bottom">
                                                       ${menu.label}
                                                       ${menu.entity||''}
                                                     </h4>
                                                     <nav class="menu">
                                                       <ul>${menu.items.map(item2html).reduce(concat,'')}</ul>
                                                     </nav>` 
                                             : html `<h4>
                                                       <a class="menu-item" 
                                                          id="${menu.items[0].view}" 
                                                          title="$${menu.items[0].title}" 
                                                          href="${menu.items[0].viewpath}">$${menu.items[0].label}</a>
                                                     </h4>`}
                                           </div>`)
                             .reduce(concat,'');
     
        if (!menuDom) {
           // Add an empty popup menu to for vertical spacing.
           this.innerHTML = '<div class="popup_menu"><h4>&nbsp;</h4></div>'
           return;
        }
        
        const selected = menus.filter((menu) => menu.selected);
        if (menuDom && selected && selected.length){
            menuDom += html `<div style="display: inline-block; position: relative; padding: 0.5em 1em;" class="entity">
                              <h4>${selected[0].label} ${selected[0].entity}</h4>
                             </div>`;
        }
        this.innerHTML=menuDom;
    }
        
}

/**
 * Module menu component.
 * <p>
 * The <code>&lt;ui-module-menu&gt;</code> component renders the module menus as list of menus.
 * @extends HTMLElement
 * @example <caption>Render module menus</caption>
 * 	 <ui-module-menu></ui-module-menu>
 *   
 */
class ViewMenu extends HTMLElement {

	render(menus){
		const concat = (a,b) => a+b;
		const item2html = function(item){
			return html `<li><a class="menu-item" id="${item.view}" title="$${item.title}" href="${item.viewpath}" ${item.target ? `target="${item.target}"` :''}>$${item.label}</a></li>`;
		};
        const menuDom = menus.filter((menu) => menu.selected)
                             .map((menu) => `<nav class="menu">
                                                 ${menu.label ? html `<h3 class="menu-heading" 
                                                                          style="position:relative" 
                                                                          title="$${menu.title}">$${menu.label}</h3>`:''}<ul>${menu.items.map(item2html).reduce(concat,'')}</ul>
                                             </nav>`)
                             .reduce(concat,'');
		this.innerHTML=menuDom;
	}
	
	select(menu,item){
		const selected = document.querySelector("nav[class='menu'] a[class~='selected']");
		if (selected) {
			selected.classList.remove("selected");
		}
		if (item) {
			item.css.add("selected");
		}
	}
	
}

/**
 * A utility class to remove embedded <code>&lt;ui-label&gt;</code> from the DOM.
 * @extends UIElement
 */
class Label extends UIElement {
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		this.outerHTML='';
	}
	
}

/**
 * Date/time component.
 * <p>
 * The <code>&lt;ui-date&gt;</code> component allows to select a date. 
 * The date is displayed as link. A click on the date opens the date picker popup.
 * The date picker supports two different modes: <em>date</em> and <em>dateTime</em>, which is the default mode.
 * In readonly mode, when no date picker is displayed, an additional <em>timestamp</em> mode is supported, which is the default mode if the date is declared readonly.
 * <p>
 * In <em>date</em>-mode the date is displayed in <code>dd-MMM-yyyy</code> format, e.g. 26-SEP-2019.<br>
 * In <em>dateTime</em>-mode the date is displayed in <code>dd-MMM-yyyy HH:mm</code> format, e.g. 26-SEP-2019 14:45<br>
 * In <em>timestamp</em>-mode the date is displayed in <code>d-MMM-yyyy HH:mm:ss.SSS</code> format, e.g. 26-SEP-2019 14:45:23.954<br>
 * </p>
 * @extends InputControl
 * @example <caption>Readonly Date</caption>
 * 	<ui-date readonly>{{date_modified}}</ui-date>
 * @example <caption>Date/Time Picker</caption>
 * 	<ui-date name="date_scheduled">{{date_scheduled}}</ui-date>
 * @example <caption>Date Picker</caption>
 * 	<ui-date name="date_scheduled" format="date">{{date_scheduled}}</ui-date>
 *   
 */
class DateTime extends InputControl {

	/**
	 * Renders the DOM.
	 */
	renderDom(){
		const date = new Date(this.innerText.trim());
		const format = this.getAttribute('format');
		const selectFormatter = function(){
			if(this.getAttribute('format') == 'date'){
				return Calendar.formatDate;
			}
			if(this.getAttribute('format') == 'dateTime'){
				return Calendar.formatDateTime;
			}
			return Calendar.formatTimestamp;
		}.bind(this);

		const format_date = selectFormatter();

		if(this.isReadonly()){
			this.outerHTML=`<time datetime="${date}">${format_date(date)}</time>`;

		} else {
			let calendar = new Calendar({'date': date,
										   'mode': this.getAttribute('format'),
										   'root': this});


			this.innerHTML=calendar.render({'show':false});

			this.addEventListener("click",(evt) => {
				evt.stopPropagation();
				evt.preventDefault();
				if(evt.target.id==='apply'){
					this.viewModel.setProperty(this.binding,calendar.getSelectedDate().toISOString());
					this.innerHTML = calendar.render({'show':false});
				} else if(evt.target.classList.contains('day')){
					let selected = this.querySelector('span.day.selected');
					if(selected){
						selected.classList.remove('selected');
					}
					evt.target.classList.add('selected');
					const year = this._view.querySelector('#year').innerText;
					const month = Calendar.MONTHS.indexOf(this._view.querySelector('#month').innerText);
					const date  = evt.target.innerText;
					calendar.setDate(year,month,date);
					this.innerHTML = calendar.render({'show':true});
				} else if(evt.target.id==='next'){
					calendar = calendar.nextMonth();
					this.innerHTML = calendar.render({'show':true});
				} else if(evt.target.id==='previous'){
					calendar = calendar.previousMonth();
					this.innerHTML = calendar.render({'show':true});
				} else if (evt.target.id === 'minute') {
					stop = false;
				} else if (evt.target.id === 'hour') {
					stop = false;
				} else {
					this.innerHTML = calendar.render({'show':true});
				}
				evt.stopPropagation();
			});
			this.addEventListener('change',(evt) => {
				evt.stopPropagation();
				evt.preventDefault();
				if(evt.target.name==='hour'){
					calendar.setHours(evt.target.value);
				}
				if(evt.target.name ==='minute'){
					calendar.setMinutes(evt.target.value);
				}

			});
			if(this.form){
	            this.form.addEventListener('UIPreExecuteAction',(evt) => {
	                this.viewModel.setProperty(this.binding,calendar.getSelectedDate().toISOString());
	            });
			}
		}
	}


}




/**
 * A utility to select a date, render a date picker, and format dates.
 */
class Calendar {

	/**
	 * Formats an integer with leading zeros.
	 * @param {Number} i the integer value
	 * @param {Number} [length=2] the length of the formatted string.
	 * @returns an integer formatted as string with the specified length
	 */
	static dateSegment(i,length){
		let offset = 100;
		if(length){
			offset = Math.pow(10,length);
		}
		return (''+(i+offset)).substr(1);
	}

	/**
	 * Formats a date as timestamp in the format <code>dd-MMM-yyyy HH:mm:ss.SSS</code>, e.g. 09-SEP-2019 14:23:57:932.
	 * @param {Date} date the date to be formatted
	 * @returns {String} the date as string in timestamp format.
	 */
	static formatTimestamp(date) {
		let day   = Calendar.dateSegment(date.getDate())
		let month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][date.getMonth()];
		let year  = date.getFullYear();
		return `${day}-${month}-${year} ${Calendar.dateSegment(date.getHours())}:${Calendar.dateSegment(date.getMinutes())}:${Calendar.dateSegment(date.getSeconds())}.${Calendar.dateSegment(date.getMilliseconds(),3)}`;
	};

	/**
	 * Formats a date as date/time in the format <code>dd-MMM-yyyy HH:mm</code>, e.g. 09-SEP-2019 14:23.
	 * @param {Date} date the date to be formatted
	 * @returns {String} the date as string in date/time format
	 */
	static formatDateTime(date) {
		let day   = Calendar.dateSegment(date.getDate())
		let month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][date.getMonth()];
		let year  = date.getFullYear();
		return `${day}-${month}-${year} ${Calendar.dateSegment(date.getHours())}:${Calendar.dateSegment(date.getMinutes())}`;
	};

	/**
	 * Formats a date as date in the format <code>dd-MMM-yyyy</code>, e.g. 09-SEP-2019
	 * @param {Date} date the date to be formatted
	 * @returns {String} the date as string in date format
	 */
	static formatDate(date){
		let day   = Calendar.dateSegment(date.getDate());
		let month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][date.getMonth()];
		let year  = date.getFullYear();
		return `${day}-${month}-${year}`;
	};

	static get DAYS_IN_MONTH(){
		return [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
	}

	/**
	 * Tests whether the given year is a leap year.
	 * @param {Number} year the full year
	 */
	static isLeapYear(year) {
		if (year % 4 == 0) {
			if (year % 100 == 0) {
				if (year % 400 == 0) {
					return true;
				}
				return false;
			}
			return true;
		}
		return false;
	};

	static get MONTHS(){
		return ['January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December']
	}

	static get HOURS_OF_DAY(){
		return ['00','01','02','03','04','05','06','07','08','09','10','11',
				'12','13','14','15','16','17','18','19','20','21','22','23']
	}

	static get MINUTES_OF_HOUR(){
		return ['00','01','02','03','04','05','06','07','08','09','10','11',
				'12','13','14','15','16','17','18','19','20','21','22','23',
				'24','25','26','27','28','29','30','31','32','33','34','35',
				'36','37','38','39','40','41','42','43','44','45','46','47',
				'48','49','50','51','52','53','54','55','56','57','58','59'];
	}

	/**
	 * Creates a new <code>Calendar</code> instance.
	 * @param {Element} cfg.root the root element of the date picker
	 * @param {Date} [cfg.date=new Date()] the date the date picker shall display
	 * @param {String} [cfg.mode='date-time'] the display mode, which is either <em>date</em> or <em>date/time</em>.
	 */
	constructor(cfg){
		if(!cfg){
			throw 'Calendar configuration is mandatory!';
		}
		this.root = cfg.root;
		this._date = cfg.date ? cfg.date : new Date();
		this._mode = cfg.mode ? cfg.mode : 'dateTime';
		this._formatDate = (this._mode === 'dateTime') ? Calendar.formatDateTime : Calendar.formatDate;
		this._date.setSeconds(0);
		this._date.setMilliseconds(0);
		if(this._mode !== 'dateTime'){
			this._date.setHours(0);
			this._date.setMinutes(0);
		}
		this._selected = new Date(this._date);
	}

	/**
	 * Returns the full year of the initial calendar date.
	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} the full year of the calendar date.
	 */
	getYear(){
		return this._date.getFullYear();
	}

	/**
	 * Returns the month  of the initial calendar date.
 	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} the month of the calendar date.
	 */
	getMonth(){
		return this._date.getMonth();
	}

	/**
	 * Returns the first day in month of the initial calendar date.
 	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * The first day is expressed as an integer between <code>0</code> (Sunday, first day in week)
	 * and <code>6</code> (Saturday, last day of week)
	 * @return {Number} the month of the calendar date.
	 */
	getFirstDayInMonth(){
		let date = new Date(this._date.getTime());
		date.setDate(1);
		return date.getDay();
	}

	/**
	 * Returns the day in month of the initial calendar date.
 	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} the day in month.
	 */
	getDayInMonth(){
		return this._date.getDate();
	}

	/**
	 * Returns the total number of days in the month of the initial calendar date.
	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} total number of days in month
	 */
	getDaysInMonth(){
		if(this._date.getMonth() == 1 && Calendar.isLeapYear(this.getYear())){
			return 29;
		}
		return Calendar.DAYS_IN_MONTH[this._date.getMonth()];

	}

	/**
	 * Returns the hours of the initial calendar date.
	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} the hours of the calendar date.
	 */
	getHours(){
		return this._date.getHours();
	}

	/**
	 * Returns the minutes of the inital calendar date.
	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} the minutes of the calendar date.
	 */
	getMinutes(){
		return this._date.getMinutes();
	}

	/**
	 * Returns the seconds of the initial calendar date.
	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} the seconds of the calendar date.
	 */
	getSeconds(){
		return this._date.getSeconds();
	}

	/**
	 * Returns the milliseconds of the initial calendar date.
	 * The initial calendar date is the date that was specified when the calendar was instantiated.
	 * @return {Number} the milliseconds of the calendar date.
	 */
	getMilliseconds(){
		return this._date.getMilliseconds();
	}

	/**
	 * Creates a new calendar that displays the month after the month in the initial calendar date.
 	 * The initial calendar date is the date that was specified when the calendar was instantiated.
 	 * @return {Calendar} a calendar to display the next month
	 */
	nextMonth(){
		let date = new Date(this._date.getTime());
		date.setMonth(date.getMonth()+1);
		let calendar = new Calendar({'mode':this._mode,
							 		 'root':this._root,
							 		 'date':date});
		calendar._selected = this._selected;
		return calendar;
	}

	/**
	 * Creates a new calendar that displays the month before the month in the initial calendar date.
 	 * The initial calendar date is the date that was specified when the calendar was instantiated.
 	 * @return {Calendar} a calendar to display the previous month
	 */
	previousMonth(){
		let date = new Date(this._date.getTime());
		date.setMonth(date.getMonth() - 1);
		let calendar = new Calendar({'mode':this._mode,
	 		 						 'root':this._root,
	 		 						 'date':date});
		calendar._selected = this._selected;
		return calendar;
	}

	/**
	 * Renders the calendar time section.
	 */
	_renderTime(){
		let selected = function(a,b){
			return a==b ? 'selected' : '';
		};

		return `<div class="time">
					<div class="form-group">
						<div class="label">
							<label for="hour">Hour</label>
						</div>
						<div class="input">
			 				<select id="hour" name="hour" class="form-select">
			 					${Calendar.HOURS_OF_DAY.map(hour => `<option value="${hour}" ${selected(this._selected.getHours(),hour)} >${hour}</option>`).reduce((a,b) => a+b,'')}
							</select>
						</div>
					</div><div class="form-group">
						<div class="label">
							<label for="minute">Minute</label>
						</div>
						<div class="input">
							<select id="minute" name="minute" class="form-select">
								${Calendar.MINUTES_OF_HOUR.map(minute => `<option value="${minute}" ${selected(this._selected.getMinutes(),minute)} >${minute}</option>`).reduce((a,b) => a+b,'')}
			 				</select>
						</div>
					</div>
				</div>`;
	}

	/**
	 * Renders the calendar date section.
	 */
	_renderDate() {
		// Create a span element for every day in the current month.
		let dayElements = [];
		for(let i=0; i < this.getFirstDayInMonth(); i++){
			// Create empty offset elements if the first day in month is not a Sunday
			dayElements.push('<span>&nbsp;</span>');
		}
		let selected = function(date){
			if(this._date.getFullYear() != this._selected.getFullYear()){
				return '';
			}
			if(this._date.getMonth() != this._selected.getMonth()){
				return '';
			}

			return this._selected.getDate() == date ? 'selected' : '';
		}.bind(this);

		for(let i=1; i <= this.getDaysInMonth(); i++){
			dayElements.push(`<span class="${selected(i)} day">${i}</span>`);
		}

		return `<div>
					<div class="month">
						<span id="previous" class="control">&#10094;</span><div>
							<span id="month">${Calendar.MONTHS[this.getMonth()]}</span>
							<span id="year">${this.getYear()}</span>
						</div><span id="next" class="control">&#10095;</span>
					</div>
					<div class="days">
						<span>Sun</span><span>Mon</span><span>Tue</span><span>Wen</span><span>Thu</span><span>Fri</span><span>Sat</span>
					</div>
					<div class="page">
						${dayElements.reduce((a,b)=>a+b,'')}
					</div>
				<div>`;
	};

	/**
	 * Renders the calendar widget.
	 */
	render(mode) {
		return `<span class="messagebox-container">
				<a href="#"><time datetime="${this.getSelectedDate()}">${this._formatDate(this.getSelectedDate())}</time></a>
				${mode && mode.show ? ` <div class="messagebox">
											<div class="calendar">
												${this._renderDate()}
												${this._mode != 'date' ? this._renderTime() : ''}
											<button class="btn btn-sm btn-block" style="margin-top: 10px" id="apply">Apply</button>
		 								</div> ` : ''}
		 		</div>`;

	};

	/**
	 * Sets the selected date.
	 * @param {Number} year the full year
	 * @param {Number} month the month, starting with 0 for January and ending with 11 for December
	 * @param {Number} date the day in month
	 */
	setDate(year,month,date){
		this._selected.setFullYear(year);
		this._selected.setMonth(month);
		this._selected.setDate(date);
	}

	/**
	 * Sets the selected hours.
	 * @param {Number} hours the hours in the day.
	 */
	setHours(hours){
		this._selected.setHours(hours,this._selected.getMinutes(),0,0);
	}

	/**
	 * Sets the selected minutes.
	 * @param {Number} minutes the minute.
	 */
	setMinutes(minutes){
		this._selected.setHours(this._selected.getHours(),minutes,0,0);
	}

	/**
	 * Returns the selected date.
	 * @returns {Date} the selected date.
	 */
	getSelectedDate(){
		return this._selected;
	}

}

/**
 * Tag editor component.
 * <p>
 * The tag editor allows to manage the tags assigned to an entity.
 * A tag is a free-form string. Tags are stored as an array of string.
 * The tag editor reads the string and creates controls to remove tags or add new tags.
 * @extends InputControl
 * @example <caption>Tag Editor</code>
 * <ui-tags name="tags">
 *   <ui-note>Manage the tags of this element</ui-note>.
 * </ui-tags>
 * 
 */
class TagEditor extends InputControl{
	
	/**
	 * Renders the DOM.
	 */
	renderDom(){
		
		const note = this.note;

        let label = '';
        if(this.label){
            label = `<div>
                        <label>${this.label}</label>
                    </div>`;
        }
		
		const renderTags = function(){
			const tags = this.viewModel.getProperty(this.binding);
			if(this.readonly){
				return html `<ol class="tags">
							   ${tags && tags.map(tag => html `<li class="tag">$${tag}</li>`).reduce((a,b) => a+b,'')}
						     </ol>`;
			}
			
			return `<div class="tag-editor">
			          ${label}
					  <ol class="tags">
						  ${tags && tags.length > 0 ? tags.map(tag => html `<li class="tag"><span>$${tag}</span><button name="remove-tag" class="btn btn-sm btn-danger" title="Remove tag $${tag}" data-tag="$${tag}">-</button></li>`).reduce((a,b) => a+b) : ''}
					  </ol>
					  <span style="position:relative"><input type="text" name="new-tag"><button name="add-tag" title="Add new tag" class="btn btn-sm btn-outline">+</button></span>
				    </div>
					<p class="note">${note}</p>`;
		}.bind(this);
		
		this.innerHTML = renderTags();
		
		this.addEventListener('click',(evt) => {
			evt.stopPropagation();
			evt.preventDefault();
			if(evt.target.name==='remove-tag'){
				let tags = this.viewModel.getProperty(this.binding);
				tags = tags.filter(tag => tag != evt.target.getAttribute('data-tag'));
				this.viewModel.setProperty(this.binding,tags);
				this.innerHTML = renderTags();
			} else if(evt.target.name==='add-tag'){
				let tag = this.querySelector("input[name='new-tag']").value;
				let tags = this.viewModel.getProperty(this.binding);
				if(!tags){
					tags = [];
					this.viewModel.setProperty(this.binding,tags);
				}
				if(tags.indexOf(tag) < 0){
					tags.push(tag)
					this.innerHTML = renderTags();
				}
			}
			
		});
	}
	
}

class RefreshButton extends Button {
    
    constructor(){
        super();
    }
    
    get name(){
        const name = super.name;
        if (name){
            return name;
        }
        return 'refresh';
    }
    
    renderDom(){
        const form = this.form;
        super.renderDom();
        form.querySelector(`button#${this.name}`).addEventListener('click',(evt) => {
            this.controller.reload();
            evt.stopPropagation();
            evt.preventDefault();
        });
    }
    
}


const randomStringAlphabet = 'AaBbCcDdEeFfGgHhIiJjKkLlMmMnOoPpQqRrSsTtUuVvWwXxYyZz'
const randomStringAlphabetSize = randomStringAlphabet.length

function random_string(size){
	let s = "";
	for ( let i = 0; i < size; i++ ) {
      s += randomStringAlphabet.charAt(Math.floor(Math.random() * randomStringAlphabetSize));
   	}
	return s;
}

/**
 * The copy button copies a value to the clipboard. 
 * The value is read from the value attribute.
 */
class CopyButton extends Button {
	
	constructor(){
		super()
	}
	
	get disabled(){
		return false
	}
	
	get readonly(){
		return false
	}
	
    get name(){
        let name = super.name;
        if(name){
			return name;
		}
		name='copy_'+random_string(5);
		this.setAttribute("name",name);
		return name;
    }

	renderDom(){
		const form = this.form;
		super.renderDom();
		form.querySelector(`button#${this.name}`).addEventListener('click',(evt)=>{
			evt.stopPropagation();
			evt.preventDefault();
			let value = this.getAttribute("value");
			if (!value){
				// Check if this copy button is nested into a input control
				let element = new Element(evt.target);
				element = element.up("ui-input,ui-select");
				value = element.value();
			}
			if (value){
				if (navigator.clipboard && window.isSecureContext){
					navigator.clipboard.writeText(value);
				} else {
					// text area method
			        const textArea = document.createElement("textarea");
			        textArea.value = value;
			        // make the textarea out of viewport
			        try {
				        textArea.style.position = "fixed";
				        textArea.style.left = "-999999px";
				        textArea.style.top = "-999999px";
				        document.body.appendChild(textArea);
				        textArea.focus();
				        textArea.select();
				        document.execCommand('copy');
					} finally {
				        textArea.remove();
					}	
				}
				
				if (value.length > 15 ){
					value = value.substring(0,15)+'...';
				}
				this.controller.info(html `"$${value}" copied to clipboard`);
			}
		});
	}
		
}


class Paginator extends UIElement {
    
    renderDom(){
        const params = this.location.params;
        const offset = parseInt(this.getAttribute('offset'));
        const limit  = parseInt(this.getAttribute('limit'));
        const size   = parseInt(this.getAttribute('size'))
        const eof    = (this.getAttribute('eof') == 'true');
        
        this.innerHTML=`<ui-actions>
                            <ui-button name="next" small ${eof ? "disabled" : ""}>Next</ui-button>                
                            <ui-button name="prev" small ${offset == 0 ? "disabled" : ""}>Previous</ui-button>
                        </ui-actions>`;
        
        this.addEventListener('click',(evt) => {
           evt.stopPropagation();
           evt.preventDefault();
           if(evt.target.name == 'next'){
               params.offset=offset+limit;
               this.controller.reload(params);
           } else {
               params.offset=Math.max(0,offset-limit);
               this.controller.reload(params);
           }
        });
    }
}


// Register view first to avoid troubles with DOM rendering.
customElements.define('ui-view',View);
customElements.define('ui-view-menu',ViewMenu);
customElements.define('ui-module-menu',ModuleMenu);
customElements.define('ui-module-container',ModuleContainer);
customElements.define('ui-modules',MainMenu);
customElements.define('ui-link',Link);
customElements.define('ui-section',Section);

// Register all components
customElements.define('ui-actions',Actions);
customElements.define('ui-blankslate',Blankslate);
customElements.define('ui-button',Button);
customElements.define('ui-checkbox',Checkbox);
customElements.define('ui-code',Code);
customElements.define('ui-composition',Composition);
customElements.define('ui-confirm',ConfirmDialog);
customElements.define('ui-date',DateTime);
customElements.define('ui-details',Details);
customElements.define('ui-element',UIElement);
customElements.define('ui-filter',Filter);
customElements.define('ui-form',Form);
customElements.define('ui-group',Group);
customElements.define('ui-input',InputText);
customElements.define('ui-number',InputNumber);
customElements.define('ui-password',Password);
customElements.define('ui-radio',RadioButton);
customElements.define('ui-select',Select);
customElements.define('ui-tags',TagEditor);
customElements.define('ui-textarea',Textarea);
customElements.define('ui-view-header',ViewHeader);

//Nested elements must be registered at the end to avoid troubles when rendering the DOM
customElements.define('ui-label',Label);
customElements.define('ui-note',Note);
customElements.define('ui-refresh',RefreshButton);
customElements.define('ui-copy',CopyButton);
customElements.define('ui-paginator',Paginator);

//html escape function
//List of the characters we want to escape and their HTML escaped version
const chars = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;"
};

//Dynamically create a RegExp from the `chars` object
const re = new RegExp(Object.keys(chars).join("|"), "g");

//Return the escaped string
const htmlEscape = (str = "") => String(str).replace(re, match => chars[match]);

export const html = (literals, ...substs) => {
  return literals.raw.reduce((acc, lit, i) => {
      let subst = substs[i - 1];
      if (Array.isArray(subst)) {
          subst = subst.join("");
      } else if (literals.raw[i - 1] && literals.raw[i - 1].endsWith("$")) {
          // If the interpolation is preceded by a dollar sign,
          // substitution is considered unsafe and will be escaped
          acc = acc.slice(0, -1);
          subst = htmlEscape(subst);
      }

      return acc + subst + lit;
  });
};
