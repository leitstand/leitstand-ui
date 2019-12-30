/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
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
import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;
import static java.util.stream.Collectors.toList;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Describes a menu of a module and the menu items respectively.
 * <p>
 * Every menu requires a unique name and a non-empty list of menu items.
 * All other properties are optional.
 * </p> 
 */
public class ModuleMenu {
	
	/**
	 * Returns a new builder for an immutable <code>ModuleMenu</code> instance.
	 * @return a new <code>ModuleMenu</code> instance.
	 */
	public static Builder newModuleMenu() {
		return new Builder();
	}

	/**
	 * The builder for <code>ModuleMenu</code> instances.
	 */
	public static class Builder {
		
		private ModuleMenu menu = new ModuleMenu();
		
		/**
		 * Sets the module menu name.
		 * @param name - the menu name
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withName(String name) {
			assertNotInvalidated(getClass(), menu);
			menu.menu = name;
			return this;
		}

		/**
		 * Sets the module menu label to be displayed in the UI.
		 * @param name - the menu label
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withLabel(String label) {
			assertNotInvalidated(getClass(), menu);
			menu.label = label;
			return this;
		}
		
		/**
		 * Sets the module menu title to be displayed as tooltip in the UI.
		 * @param name - the menu title
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withTitle(String title) {
			assertNotInvalidated(getClass(), menu);
			menu.title = title;
			return this;
		}

		
		/**
		 * Sets the default query parameters to be passed to the server when opening an item in this menu.
		 * @param query - the query parameters
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withQuery(Map<String,String> query) {
			assertNotInvalidated(getClass(), menu);
			menu.query = new TreeMap<>(query);
			return this;
		}

		/**
		 * Sets which properties have to be present in the view model to enable this menu.
		 * @param requires - the required properties to enable this menu.
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withRequires(String... requires) {
			return withRequires(asList(requires));
		}
		
		/**
		 * Sets which properties have to be present in the view model to enable this menu.
		 * @param requires - the required properties to enable this menu.
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withRequires(Collection<String> requires) {
			assertNotInvalidated(getClass(), menu);
			menu.requires = new TreeSet<String>(requires);
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
			assertNotInvalidated(getClass(), menu);
			menu.viewModel = unmodifiableList(new ArrayList<>(matchers));
			return this;
		}
		
		/**
		 * Sets the builders of the menu items of this menu.
		 * @param builder - all menu item builders
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withItems(ModuleMenuItem.Builder... builder) {
			return withItems(stream(builder)
							 .map(ModuleMenuItem.Builder::build)
							 .collect(toList()));
			
		}
		
		
		/**
		 * Sets the menu items of this menu
		 * @param items - the menu items
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withItems(ModuleMenuItem...items) {
			return withItems(Arrays.asList(items));
		}

		/**
		 * Sets the menu items of this menu
		 * @param items - the menu items
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withItems(List<ModuleMenuItem> items) {
			assertNotInvalidated(getClass(), menu);
			menu.items = new ArrayList<>(items);
			return this;
		}
		
		/**
		 * Returns an immutable <code>ModuleMenu</code> instance and invalidates this builder. 
		 * Any further interaction with this builder raises an exception.
		 * @return
		 */
		public ModuleMenu build() {
			try {
				assertNotInvalidated(getClass(), menu);
				requires(getClass(),"items",menu.items);
				return menu;
			} finally {
				this.menu = null;
			}
		}
		
	}
	
	private String menu;
	private String label;
	private String title;
	private Map<String,String> query = emptyMap();
	private Set<String> requires = emptySet();
 	private List<ModuleMenuItem> items = emptyList();
 	private List<ViewModelProperty> viewModel = emptyList();


 	/**
 	 * Returns the name of this menu.
 	 * @return the name of this menu.
 	 */
 	public String getMenu() {
		return menu;
	}
 	
 	/**
 	 * Returns the menu label to be displayed in the UI.
 	 * @return the label of this menu.
 	 */
	public String getLabel() {
		return label;
	}
	
	/**
	 * Returns the menu title.
	 * The title contains a brief description of this menu and 
	 * is typically displayed as tooltip message.
	 * @return the title of this menu.
	 */
	public String getTitle() {
		return title;
	}
	
	/**
	 * Returns the default query parameters to be passed to all views accessible from this menu.
	 * @return the default query parameters.
	 */
	public Map<String, String> getQuery() {
		return unmodifiableMap(query);
	}
	
	/**
	 * Returns a set of properties that must be present in the current view model to enable this menu.
	 * @return the view model properties to enable this menu.
	 */
	public Set<String> getRequires() {
		return unmodifiableSet(requires);
	}

	/**
	 * Returns the view model property matchers that must be satisfied to enable this menu.
	 * @return the view model property matchers to enable this menu. 
	 * 		   Returns an empty list if no matchers are specified.
	 */
	public List<ViewModelProperty> getViewModel() {
		return viewModel;
	}

	
	/**
	 * Returns a list of all menu items.
	 * @return the list of menu items.
	 */
	public List<ModuleMenuItem> getItems() {
		return unmodifiableList(items);
	}
	
 	

	
}
