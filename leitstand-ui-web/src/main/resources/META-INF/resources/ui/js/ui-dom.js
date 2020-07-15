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
 * <h2>DOM Library</h2>
 * The DOM library simplifies to query and manipulate the Document Object Model (DOM).
 * The {@linkcode Element} class wraps a native DOM element and provides means for essential DOM operations like managing CSS classes for example.
 * More details can be found on the method documentation.
 * The {@linkcode Dom} class is the base class for all DOM manipulators.
 * @module
 */

/**
 * Base class for DOM manipulators. 
 * <p>
 * The <code>Dom</code> class provides methods to query the Document Object Model (DOM) and to maintain templates for rendering the body content.
 * </p>
 */
export class Dom {

	/**
	 * Creates a new <code>Dom</code> instance.
	 */
	constructor(){
		this._template = "";
		this._partials = {};
		
	}

	/**
	 * Returns an <code>Element</code> that wraps a native DOM element.
	 * <p>
	 * The <code>Element</code> simplifies working with the DOM by proving a bunch of utility methods for commonly needed DOM operations.
	 * This method accepts a DOM element, a CSS selector, or an element ID to access the native DOM element to be wrapped.
	 * </p>
	 * @param {Element|String} query the DOM element, a CSS selector or the element ID of the element to be wrapped.
	 * @returns {ui-dom~Element} the wrapped DOM element or <code>null</code> if no native DOM element was found
	 */
	element(query) {
		if(query.unwrap){
			// Do not wrap an already wrapped element.
			return query;
		}
		if (query.tagName) {
			// Decorate a native DOM element.
			return new Element(id, this);
		}

		// Try to fetch element assuming the argument is the element id...
		let element = document.getElementById(query);
		if (element) {
			return new Element(element, this);
		}
		// Apparently id is not an ID so let's check whether it is a CSS selector
		try{
			element = document.querySelector(query);
			if (element) {
				return new Element(element, this);
			}
		} catch (e){
			// Invalid id
		}
					
		return null;
	}
	
	/**
	 * Returns an <code>Element</code> that wraps a native DOM input element.
	 * <p>
	 * The <code>Element</code> simplifies working with the DOM by proving a bunch of utility methods for commonly needed DOM operations.
	 * This method accepts a DOM element, a CSS selector, the input element name, or an element ID to access the native DOM element to be wrapped.
	 * </p>
	 * @returns {Element} the wrapped DOM element or <code>null</code> if no native DOM element was found
	 */
	input(query) {
		let element = this.element(query);
		if(element){
			return element;
		}
		return new Element(document.querySelector(`input[name='${query}']`), this);
	}
	
	/**
	 * Returns an array of all elements that match the specified selector query.
	 * @param {String} query the CSS selector
	 * @returns {ui-domElement[]} All matching elements.
	 */
	elements(query) {
		return [...document.querySelectorAll(query)]
						   .map(element => new Element(element));
	}
	
	/**
	 * Returns a template to render the complete view or only parts of the view.
	 * @param {String} [id] The ID of the template. If unspecified, the entire view is considered as a single template.
	 * @returns {Template} the executable template. Pass the JSON model to the <code>html</code> function of the returned template in order to
	 * render the HTML output.
	 */
	template(id) {
		let template = this._template;
		if (id) {
			template = this._partials[id];
		}
		
		return {
			/**
			 * Renders HTML output by processing the specified view model.
			 * @param {object} model The view model.
			 * @returns {String} the rendered HTML output
			 * @memberof Template
			 * @method html
			 */
			"html" : function(model) {
				return Mustache.to_html(template, model);
			}
		}
	}

}

/**
 * A single element of the document object model.
 * <p>
 * The <code>Element</code> class wraps a native DOM element and provides convenience methods to read, navigate through, and manipulate the DOM.
 * </p>
 * @extends Dom
 */
export class Element extends Dom{
	
	/**
	 * A factory method to create an <code>Element</code> from a native DOM element.
	 * @param {Element} element the native DOM element
	 * @param {Object} [scope] the <code>this</code> pointer for event listeners bound to this <code>Element</code>.
	 * @returns {ui-dom~Element} an element for the native DOM element
	 */
	static wrap(element,scope){
		if(element.unwrap){
			return element;
		}
		return new Element(element,scope);
	}

	/**
	 * Returns the native DOM element wrapped by the specified <code>Element</code>.
	 * @param {ui-dom~Element} element the element to retrieve the native DOM element from
	 * @return {Element} the underlying native DOM element
	 */
	static unwrap(element){
		if(element.unwrap){
			return element.unwrap();
		}
		return element;
	}
	
	/**
	 * Creates an <code>Element</code>.
	 * @param {Element} element the native DOM element
	 * @param {Object} [scope] the <code>this</code> pointer for event listeners bound to this <code>Element</code>.
	 */
	constructor(element,scope){
		super();
		this._element = element;
		this._scope = scope;
	}
	
	/**
	 * Returns the inner HTML content of this element.
	 * Replaces the inner HTML content if a new content is specified.
	 * 
	 * @param {String} [content] the new inner HTML content
	 * @returns {String} the inner HTML content of the element
	 */
	html(content) {
		if (content || content === '') {
			this._element.innerHTML = content;
		}
		return this._element.innerHTML;
	}
	
	/**
	 * Returns the inner text content of this element.
	 * Replaces the inner text content if a new content is specified.
	 * @param {String} [content] the new inner text content
	 * @return {String} the inner text content of the element
	 */
	text(content) {
		if(content || content === ''){
			this._element.innerText = content;
		}
		return this._element.innerText;
	}
	
	/**
	 * Returns the value of this element if a value exists.
	 * <ul>
	 *  <li>Returns the <code>value</code> attribute of a checked checkbox. Returns <code>null</code> if the checkbox is unchecked</li>
	 *  <li>Returns the <code>value</code> attribute of the selected radio button. 
	 *  	If this element represents an unselected radio button, the value of the selected radio button with the same name is returned.</li> 
	 *  <li>Returns the value of the selected option of a select box.</li>
	 *  <li>Returns the <code>value</code> attribute of all other input elements, such as text input fields, password input fields or textarea</li>
	 * </ul>
	 * Updates the element value if a new value is specified.
	 * @param {String} [value] the new value
	 * @return {String} the element value if a value exists. 
	 */
	value(value) {
		if (!this._element){
			// Wrapped element does not exist!
			return null;
		}
		if (this._element.type == 'checkbox') {
			return this._element.checked ? this._element.value : null;
		}
		if (this._element.type == 'radio') {
			const selected = document.querySelectorAll(`input[name='${this._element.name}']:checked`);
			if(selected){
				return selected.value;
			}
		}
		if (this._element.value || value) {
			const old = this._element.value;
			if(value !== undefined){
				this._element.value = value;
			}
			return old;
		}
		if (this._element.nodeName === 'SELECT') {
			const options = this._element.getElementsByTagName('option');
			let selectedOption = -1;
			if(value){
				//TODO Add multivalue support
				selectedOption = this._element.selectedIndex;
				for (let i = 0; i < options.length; i++){
					if(options.item(i).value === value){
						selectedOption = i;
						break;
					}
				}
				this._element.selectedIndex = selectedOption;
			}
			if(this._element.multiple){
				const selections = [];
				options.forEach(function(option){
					if(option.selected){
						selections.push(option.value);
					}
				});
				return selections;
			}
			return selectedOption >= 0 ? options.item(selectedOption).value : null;
		}
		return this._element.value;
	}
	
	/**
	 * Returns the values of all input elements with the same name as this element.
	 * The values of unchecked check boxed or radio buttons are ignored.
	 * @return {String[]} all input values.
	 */
	values(){
		if(this.isElement('input')){
			return [...document.querySelectorAll(`input[name='${this._element.name}']`)] // Select all inputs with the same name and convert NodeList to an array
				   .filter(input => input.checked || input.selected || input.type=='text') // Filter for text field, selected radio buttons and checked checkboxes
				   .map(input => input.value); // Extract the value.
		}
		const value = this.value();
		if(Array.isArray(value)){
			return value;
		}
		return [value];
	}
	
	/**
	 * Checks or unchecks a checkbox or radio button and returns the new checked state.
	 * <p>
	 * The method has no effect when executed on other elements than radio button or checkbox.
	 * @param {boolean} [checked=true] the new checked state
	 * @returns {boolean} Whether the check box is checked (<code>true</code>) or unchecked (<code>false</code>).
	 */
	check(){
		if(arguments.length == 0){
			this._element.checked = true;
			return true;
		}
		this._element.checked = arguments[0];
		return this._element.checked;
	}
	
	/**
	 * Returns the checked state of a checkbox or radio button.
	 * Returns <code>true</code> if a checkbox is checked or the radio button is selected, 
	 * returns <code>false</code> if the checkbox is unchecked or the radio button is not selected, and
	 * returns <code>undefined</code> if the element has no checked state.
	 * @returns {boolean|undefined} the checked state of this element or <code>undefined</code> if no checked state exists.
	 */
	isChecked(){
		return this._element.checked;
	}
	
	/**
	 * Focuses this element.
	 */
	focus() {
		this._element.focus();
	};
	
	/**
	 * Returns the <code>style</code> attribute of the underlying native DOM element.
	 * @returns {Object} the <code>style</code> attribute of the underlying native DOM element.
	 * @readonly
	 */
	get style(){
		return this._element.style
	}
	
	/**
	 * Returns a CSS object to <code>add</code> CSS classes to or <code>remove</code> CSS classes from 
	 * the decorated element class list and to check whether a class is already
	 * assigned to the element, i.e. the class list <code>contains</code> a particular class.
	 * @returns {CSS} The CSS classes of this element.
	 */
	get css() {
		const element = this._element;
		return {
			/**
			 * Removes the specified classes from the CSS classes of the underlying element.
			 * @param {...string} cl the CSS classes to be removed
			 * @memberof css
			 * @method remove
			 */
			"remove" : function() {
				for (let i = 0; i < arguments.length; i++) {
					element.classList.remove(arguments[i]);
				}
			},
			/**
			 * Adds the specified classes to the CSS classes of the underlying element.
			 * @param {...string} cl the CSS classes to be added
			 * @memberof css
			 * @method add
			 */
			"add" : function() {
				for (let i = 0; i < arguments.length; i++) {
					element.classList.add(arguments[i]);
				}
			},
			/**
			 * Returns whether the specified CSS class is assigned to the underlying element.
			 * @param {String} cl the CSS class name
			 * @returns {boolean} <code>true</code> if the class list contains the specified class name, otherwise <code>false</code>
			 * @memberof css
			 * @method contains
			 */
			"contains" : function(cl) {
				return element.classList.contains(cl);
			}
		};
	}
	
	/**
	 * Returns the attribute with the specified name.
	 * @param {String} name the attribute name
	 * @returns {String} the attribute value or <code>null<code> if the attribute does not exist
	 */
	getAttribute(name) {
		return this._element.getAttribute(name);
	}
	
	/**
	 * Sets the value of the attribute with the specified name.
	 * @param {String} name the attribute name
	 * @param {String} value the attribute value
	 */
	setAttribute(name, value) {
		return this._element.setAttribute(name, value);
	};
	
	/**
	 * Returns the underlying native DOM element
	 * @returns {Element} the underlying native DOM element
	 */
	unwrap() {
		return this._element;
	};
	
	/**
	 * Disables an input element.
	 */
	disable() {
		this._element.disabled = 'disabled';
	};
	
	/**
	 * Enables an input element.
	 */
	enable() {
		this._element.disabled = null;
	};
	
	/**
	 * Adds an event listener to the underlying native DOM element. The event listener is bound 
	 * to the scope specified when this element instance was created if a scope was specified.
	 * @param {String} event The event to be observed
	 * @param {function} handler The event listener
	 * @param {boolean} [useCapture=false] - whether the listener should be called in the capturing phase 
	 * 										 (<code>true</code>) or bubbling phase (<code>false</code>).
	 */
	addEventListener(event, handler, useCapture) {
		if(useCapture === undefined){
			useCapture = false;
		}
		
		this._element.addEventListener(event, 
		                         	   this._scope ? handler.bind(this._scope) : handler, 
		                         	   useCapture);
	};
	
	/**
	 * Removes all child elements of this element from the DOM.
	 */
	clear() {
		this._element.innerHTML = '';
	}
	
	
	/**
	 * Returns the first child element matching the given CSS selector
	 * @param {String} query the CSS selector
	 * @return {ui-dom~Element} the first matching child element or <code>null</code> if no match exists.
	 */
	select(query) {
		const selected = this._element.querySelector(query);
		if (selected) {
			return new Element(selected, this._scope);
		}
		return null;
	}
	
	/**
	 * Selects all child elements matching the given CSS selector.
	 * @param {String} query the CSS selector
	 * @return {ui-dom~Element[]} all matching child element or an empty array if no match exists.
	 */
	selectAll(query) {
		return [...this._element
				   .querySelectorAll(query)]
				   .map(element => new Element(element));
	}
	
	
	/**
	 * Walks up the DOM tree to find an element with the given tag name.
	 * @param {String} name the name of the searched parent element
	 * @returns {ui-dom~Element} the matching parent element or <code>null</code> if no match exists.
	 */
	up(name) {
		let parent = this._element.parentNode;
		while (parent && parent.tagName !== name.toUpperCase()) {
			parent = parent.parentNode;
		}
		if (parent) {
			return new Element(parent, this._scope);
		}
		return null;
	}
	
	/**
	 * Tests whether the element is of a certain type.
	 * @param {String} name the tag name
	 * @returns {boolean} <code>true</code> if this element matches the specified tag name, otherwise <code>false</code>.
	 */
	isElement(name){
		return this._element.tagName == name.toUpperCase();
	}
	
	/**
	 * Simulates a click on the element.
	 */
	click(){
		this._element.click();
	}
	
	/**
	 * The element id. 
	 * <p>
	 * The id is read from the id attribute of the underlying DOM element.
	 * </p>
	 * @return the id attribute of the underlying native DOM element.
	 * @readonly 
	 */
	get id() {
		return this._element.id;
	}
	
	/**
	 * The element name. 
	 * <p>
	 * The name is read from the name attribute of the underlying DOM element.
	 * </p>
	 * @return the id attribute of the underlying native DOM element.
	 * @readonly
	 */	
	get name() {
		return this._element.name;
	}
}

