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
import static io.leitstand.commons.model.BuilderUtil.requires;
import static java.util.Arrays.asList;
import static java.util.Arrays.stream;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static java.util.Collections.emptySet;
import static java.util.Collections.unmodifiableList;
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
 * Describes a single menu item of a module menu.
 * <p>
 * Every <code>ModuleMenuItem</code> requires an unique name and a view to be displayed.
 * All other properties are optional.
 * </p>
 */
public class ModuleMenuItem {

	/**
	 * Returns a builder to create an immutable <code>ModuleMenuItem</code> instance.
	 * @return a <code>ModuleMenuItem</code> builder.
	 */
	public static Builder newModuleMenuItem() {
		return new Builder();
	}

	/**
	 * The builder for an immutable <code>ModuleMenuItem</code> instance.
	 */
	public static class Builder {
		
		private ModuleMenuItem item = new ModuleMenuItem();
		
		/**
		 * Sets the name of the menu item.
		 * @param name the item name
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withName(String name) {
			assertNotInvalidated(getClass(), item);
			item.item = name;
			return this;
		}

		/**
		 * Sets the label of the menu item to be displayed in the UI.
		 * @param label the item label
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withLabel(String label) {
			assertNotInvalidated(getClass(), item);
			item.label = label;
			return this;
		}
		
		/**
		 * Sets the title of the menu item to be displayed as tooltip in the UI.
		 * @param title the item title
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withTitle(String title) {
			assertNotInvalidated(getClass(), item);
			item.title = title;
			return this;
		}
		
		/**
		 * Sets the view template path to the view represented by this menu item.
		 * The view model is passed to the specified view template to render the view.
		 * @param view the view template path.
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withView(String view) {
			assertNotInvalidated(getClass(), item);
			item.view = view;
			return this;
		}

		/**
		 * Sets the controller for the current menu item.
		 * @param controller the controller script
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withController(String controller) {
			assertNotInvalidated(getClass(), item);
			item.controller = controller;
			return this;
		}
		
		/**
		 * Sets the query parameters to be passed to the server when opening this view.
		 * The specified query parameters are merged with the default query parameters specified in the {@link ModuleMenu}.
		 * The parameters specified on the item have precedence over the default query parameters specified in the menu. 
		 * This enables an item to overwrite the default parameters.
		 * @param query the item query parameters
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withQuery(Map<String,String> query) {
			assertNotInvalidated(getClass(), item);
			item.query = new TreeMap<>(query);
			return this;
		}

		/**
		 * Sets the properties that have to present in the view model in order to enable this menu item.
		 * @param requires the properties which have to be present to enable this menu item
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withRequires(String... requires) {
			return withRequires(asList(requires));
		}

		/**
		 * Sets the properties that must be present in the view model in order to enable this menu item.
		 * @param requires the properties that have to be present to enable this menu item
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withRequires(Collection<String> requires) {
			assertNotInvalidated(getClass(), item);
			item.requires = unmodifiableSet(new TreeSet<String>(requires));
			return this;
		}

		/**
		 * Sets the view property matchers that must be satisfied to enable this menu item.
		 * @param matchers the property matchers that have to be satisfied
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withViewModel(ViewModelProperty.Builder... matchers) {
			return withViewModel(stream(matchers)
							 	 .map(ViewModelProperty.Builder::build)
							 	 .collect(toList()));
		}
		
		/**
		 * Sets the view property matchers that must be satisfied to enable this menu item.
		 * @param matchers the property matchers that have to be satisfied
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withViewModel(List<ViewModelProperty> matchers) {
			assertNotInvalidated(getClass(), item);
			item.viewModel = unmodifiableList(new ArrayList<>(matchers));
			return this;
		}
		
		/**
		 * Sets the roles allowed to access this menu item.
		 * @param roles the roles allowed to access this menu item.
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withRolesAllowed(String... roles) {
			return withRolesAllowed(asList(roles));
		}
		
		/**
		 * Sets the roles allowed to access this menu item.
		 * @param roles the roles allowed to access this menu item.
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withRolesAllowed(Collection<String> roles) {
			assertNotInvalidated(getClass(), item);
			item.rolesAllowed = unmodifiableSet(new TreeSet<>(roles));
			return this;
		}
		
		public ModuleMenuItem build() {
			try {
				assertNotInvalidated(getClass(), item);
				if(item.label == null || item.label.length() == 0) {
					item.label = item.item;
				}
				requires(getClass(),"item", item.item);
				requires(getClass(),"view",item.view);
			
				
				return item;
			} finally {
				this.item = null;
			}
		}

	}
	
	private String item;
	private String label;
	private String title;
	private String view;
	private String controller;
	private Map<String,String> query = emptyMap();
	private Set<String> requires = emptySet();
	private List<ViewModelProperty> viewModel = emptyList();
	private Set<String> rolesAllowed = emptySet();

	/**
	 * Returns the name of the menu item.
	 * @return the name of the menu item.
	 */
	public String getItem() {
		return item;
	}
	
	/**
	 * Returns the menu item label to be displayed in the UI.
	 * @return the menu item label
	 */
	public String getLabel() {
		return label;
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
	 * Returns the view template path.
	 * @return the view template path.
	 */
	public String getView() {
		return view;
	}
	
	/**
	 * Returns the controller file.
	 * @return the controller file.
	 */
	public String getController() {
		return controller;
	}
	
	/**
	 * Returns the query parameters to be added to the view URL in order to initialize the view properly.
	 * @return the query parameters to initialize the view.
	 */
	public Map<String, String> getQuery() {
		return query;
	}
	
	/**
	 * Returns the set of properties that must be present in the view model to activate this menu item.
	 * @return an immutable set of view model properties to activate this menu item.
	 */
	public Set<String> getRequires() {
		return unmodifiableSet(requires);
	}
	
	/**
	 * Returns the roles that are allowed to access this menu item.
	 * @return an immutable set of roles that are allowed to access this menu item
	 */
	public Set<String> getRolesAllowed(){
		return unmodifiableSet(rolesAllowed);
	}
	
	/**
	 * Returns the view model property matchers, that must be satisfied to display this menu item.
	 * @return the view model property matchers.
	 */
	public List<ViewModelProperty> getViewModel(){
		return unmodifiableList(viewModel);
	}
	
	/**
	 * Adds the specified parameters to the query parameters of this menu item. 
	 * This method is used to push down the default query parameters from 
	 * the menu to each menu item in order to simplify the processing of the module descriptor in the browser.
	 * @param parameters the query parameters to be added to this menu item.
	 */
	void addQueryParameters(Map<String,String> parameters) {
		if(this.query.size() == 0) {
			// In this case query is most likely the initial emptyMap(), which is an unmodifiable map.
			// Hence the query parameters must be exchanged.
			this.query = parameters;
			return;
		}
		for(Map.Entry<String, String> param : parameters.entrySet()) {
			if(query.containsKey(param.getKey())) {
				continue;
			}
			query.put(param.getKey(),
					  param.getValue());
		}

	}
	
}
