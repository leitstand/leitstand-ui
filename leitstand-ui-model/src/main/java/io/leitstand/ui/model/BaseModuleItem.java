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
package io.leitstand.ui.model;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;
import static java.util.Arrays.asList;
import static java.util.Arrays.stream;
import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;
import static java.util.stream.Collectors.toList;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;


/**
 * Common module menu-related settings.
 */
public abstract class BaseModuleItem implements Named {

	/**
	 * Base class for builders of <code>BaseModuleItem</code> extensions.
	 */
	public static class BaseBuilder<T extends BaseModuleItem, B extends BaseBuilder<T,B>> {
		
		protected T item;
		
		protected BaseBuilder(T item) {
			this.item = item;
		}
		

		/**
		 * Sets the label of the menu item to be displayed in the UI.
		 * @param label the item label
		 * @return a reference to this builder to continue with object creation.
		 */
		public B withLabel(String label) {
			assertNotInvalidated(getClass(), item);
			((BaseModuleItem)item).label = label;
			return (B) this;
		}
		
		/**
		 * Sets the title of the menu item to be displayed as tooltip in the UI.
		 * @param title the item title
		 * @return a reference to this builder to continue with object creation.
		 */
		public B withTitle(String title) {
			assertNotInvalidated(getClass(), item);
			((BaseModuleItem)item).title = title;
			return (B) this;
		}
		
		/**
		 * Sets the query parameters to be passed to the server when opening this view.
		 * The specified query parameters are merged with the default query parameters specified in the {@link ModuleMenu}.
		 * The parameters specified on the item have precedence over the default query parameters specified in the menu. 
		 * This enables an item to overwrite the default parameters.
		 * @param query the item query parameters
		 * @return a reference to this builder to continue with object creation.
		 */
		public B withQuery(Map<String,String> query) {
			assertNotInvalidated(getClass(), item);
			((BaseModuleItem)item).query = new TreeMap<>(query);
			return (B) this;
		}

		/**
		 * Sets the properties that have to present in the view model in order to enable this menu item.
		 * @param requires the properties which have to be present to enable this menu item
		 * @return a reference to this builder to continue with object creation
		 */
		public B withRequires(String... requires) {
			return withRequires(asList(requires));
		}

		/**
		 * Sets the properties that must be present in the view model in order to enable this menu item.
		 * @param requires the properties that have to be present to enable this menu item
		 * @return a reference to this builder to continue with object creation
		 */
		public B withRequires(Collection<String> requires) {
			assertNotInvalidated(getClass(), item);
			((BaseModuleItem)item).requires = unmodifiableSet(new TreeSet<String>(requires));
			return (B) this;
		}

		/**
		 * Sets the view property matchers that must be satisfied to enable this menu item.
		 * @param matchers the property matchers that have to be satisfied
		 * @return a reference to this builder to continue with object creation
		 */
		public B withViewModel(ViewModelProperty.Builder... matchers) {
			return withViewModel(stream(matchers)
							 	 .map(ViewModelProperty.Builder::build)
							 	 .collect(toList()));
		}
		
		/**
		 * Sets the view property matchers that must be satisfied to enable this menu item.
		 * @param matchers the property matchers that have to be satisfied
		 * @return a reference to this builder to continue with object creation
		 */
		public B withViewModel(List<ViewModelProperty> matchers) {
			assertNotInvalidated(getClass(), item);
			((BaseModuleItem)item).viewModel = unmodifiableList(new ArrayList<>(matchers));
			return (B) this;
		}
		
		/**
		 * Adds the scopes that are allowed to access this menu item.
		 * @param scopes the scopes allowed to access this menu item.
		 * @return a reference to this builder to continue with object creation.
		 */
		public B withScopesAllowed(String... scopes) {
			return withScopesAllowed(asList(scopes));
		}
		
		/**
		 * Sets the roles allowed to access this menu item.
		 * @param roles the roles allowed to access this menu item.
		 * @return a reference to this builder to continue with object creation.
		 */
		public B withScopesAllowed(Collection<String> scopes) {
			assertNotInvalidated(getClass(), item);
			((BaseModuleItem)item).scopesAllowed = unmodifiableSet(new TreeSet<>(scopes));
			return (B) this;
		}
		
		/**
		 * Sets the category of this menu artefact.
		 * The category is used as discriminator for different menu item renderer.
		 * @param category the category
		 * @return a reference to this builder to continue with object creation.
		 */
		public B withCategory(String category) {
			assertNotInvalidated(getClass(),item);
			((BaseModuleItem)item).category = category;
			return (B) this;
		}
		
	}
	
	private String label;
	private String category;
	private String title;
	private Map<String,String> query;
	private Set<String> requires;
	private List<ViewModelProperty> viewModel;
	private Set<String> scopesAllowed;
	private Map<String,Object> config;
	
	/**
	 * Returns the menu item label to be displayed in the UI.
	 * @return the menu item label
	 */
	public String getLabel() {
		return label;
	}
	
	/**
	 * Returns the web component category.
	 * @return the web component category.
	 */
	public String getCategory() {
		return category;
	}
	
	/**
	 * Returns the menu item title.
	 * The menu item title provides a brief description of the menu item 
	 * and is typically displayed as tooltip in the UI.
	 * @return a brief description of the menu item.
	 */
	public String getTitle() {
		return title;
	}
	
	/**
	 * Returns the query parameters to be added to the view URL in order to initialize the view properly.
	 * @return the query parameters to initialize the view.
	 */
	public Map<String, String> getQuery() {
		if(query == null) {
			return null;
		}
		return unmodifiableMap(query);
	}
	
	/**
	 * Returns the set of properties that must be present in the view model to activate this menu item.
	 * @return an immutable set of view model properties to activate this menu item.
	 */
	public Set<String> getRequires() {
		if(requires == null) {
			return null;
		}
		return unmodifiableSet(requires);
	}
	
	/**
	 * Returns the scopes that are allowed to access this menu item.
	 * @return an immutable set of roles that are allowed to access this menu item
	 */
	public Set<String> getScopesAllowed(){
		if(scopesAllowed == null) {
			return null;
		}
		return unmodifiableSet(scopesAllowed);
	}
	
	/**
	 * Returns the view model property matchers that must be satisfied to display this menu item.
	 * @return the view model property matchers.
	 */
	public List<ViewModelProperty> getViewModel(){
		if(viewModel == null) {
			return null;
		}
		return unmodifiableList(viewModel);
	}
	
	/**
	 * Adds the specified parameters to the query parameters of this menu item. 
	 * This method is used to push down the default query parameters from 
	 * the menu to each menu item in order to simplify the processing of the module descriptor in the browser.
	 * @param parameters the query parameters to be added to this menu item.
	 */
	void addQueryParameters(Map<String,String> parameters) {
	    if(parameters == null) {
	        return;
	    }
	    if(this.query == null || this.query.isEmpty()) {
			this.query = parameters;
			return;
		}
		for(Map.Entry<String, String> param : parameters.entrySet()) {
			if(query != null && query.containsKey(param.getKey())) {
				continue;
			}
			query.put(param.getKey(),
					  param.getValue());
		}
	}

	void addConfig(Map<String,Object> config) {
		if(config == null) {
			return; 
		}
		if(this.config == null || this.config.isEmpty()) {
			this.config = config;
		} else {
			for(Map.Entry<String, Object> param : config.entrySet()) {
				if(this.config.containsKey(param.getKey())) {
					continue;
				}
				this.config.put(param.getKey(),
						param.getValue());
			}
		}
	}
	
	void addScopesAllowed(Set<String> scopesAllowed) {
		if(scopesAllowed == null) {
			return;
		}
		if(this.scopesAllowed == null || this.scopesAllowed.isEmpty()) {
			this.scopesAllowed = scopesAllowed;
		} else {
			this.scopesAllowed.addAll(scopesAllowed);
		}
	}
	
	public void setCategory(String category) {
		this.category = category;
	}
	
	
	/**
	 * Returns the config associated with this menu item.
	 * Returns an empty map if no config exists.
	 * @return additional properties associated with this menu item.
	 */
	public Map<String, Object> getConfig() {
		if(config == null) {
			return null;
		}
		return unmodifiableMap(config);
	}
	
}
