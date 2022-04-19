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
import static java.util.Collections.unmodifiableList;
import static java.util.stream.Collectors.toList;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.json.bind.annotation.JsonbTransient;

/**
 * Leitstand module menu.
 */
public class ModuleMenu extends BaseModuleItem {
	
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
	public static class Builder extends BaseBuilder<ModuleMenu,Builder> {
		
		protected Builder() {
			super(new ModuleMenu());
		}
		
		/**
		 * Sets the module menu name.
		 * @param name - the menu name
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withName(String name) {
			assertNotInvalidated(getClass(), item);
			item.menu = name;
			return this;
		}
		
		/**
		 * Sets the expression to display the entity name.
		 * @param entity - the expression to resolve the entity name
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withEntity(String entity) {
			assertNotInvalidated(getClass(), item);
			item.entity = entity;
			return this;
		}
		
		public Builder withExpand(String name) {
			assertNotInvalidated(getClass(),item);
			item.expand = name;
			return this;
		}


		/**
		 * Sets the menu items of this menu
		 * @param items - the menu items
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withItems(ModuleMenuItem.Builder...items) {
			return withItems(stream(items)
							 .map(ModuleMenuItem.Builder::build)
							 .collect(toList()));
		}

		
		/**
		 * Sets the menu items of this menu
		 * @param items - the menu items
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withItems(ModuleMenuItem...items) {
			return withItems(asList(items));
		}

		/**
		 * Sets the menu items of this menu
		 * @param items - the menu items
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withItems(List<ModuleMenuItem> items) {
			assertNotInvalidated(getClass(), item);
			item.items = new ArrayList<>(items);
			return this;
		}
		
		/**
		 * Returns an immutable <code>ModuleMenu</code> instance and invalidates this builder. 
		 * Any further interaction with this builder raises an exception.
		 * @return
		 */
		public ModuleMenu build() {
			try {
				assertNotInvalidated(getClass(), item);
				requires(getClass(),"items",item.items);
				return item;
			} finally {
				this.item = null;
			}
		}
		
	}
	
	private String menu;
 	private List<ModuleMenuItem> items = new LinkedList<>();
 	@JsonbTransient
 	private Map<ModuleMenuItem,List<ExtensionPoint>> menuExtensions = new LinkedHashMap<>();
 	private String expand;
 	private String entity;
 	
 	/**
 	 * Returns the name of this menu.
 	 * @return the name of this menu.
 	 */
 	public String getMenu() {
		return menu;
	}
 	
	/**
	 * Returns a list of all menu items.
	 * @return the list of menu items.
	 */
	public List<ModuleMenuItem> getItems() {
		return unmodifiableList(items);
	}
	
	void addExtensions(Extension... extensions) {
		addExtensions(asList(extensions));
	}
	
	void addExtensions(List<Extension> extensions) {
	    Set<ModuleMenuItem> newItems = new LinkedHashSet<>();
		for(Extension extension : extensions) {
			// Create an extension point for each menu item to 
			// preserve the order of the contributed menu items.
			List<ModuleMenuItem> items = extension.getItems();
			if(!items.isEmpty()) {
			    newItems.addAll(items);
				ModuleMenuItem item = items.get(0);
	            List<ExtensionPoint> itemPoints = menuExtensions.computeIfAbsent(item, k -> new LinkedList<>());
	            itemPoints.add(extension.getExtensionPoint());
	            
	            // All additional menu items are linked to the previous item to preserve the configured order
	            for(int j=0,i=1; i < items.size(); j++,i++) {
	                item = items.get(i);
	                itemPoints.add(new ExtensionPoint().after(items.get(j).getName()));
	            }
			}
		}
		// Add all contributed items.
		if(this.items == null) {
			this.items = new LinkedList<>();
		}
		items.addAll(newItems);
		
		// Sort all points according to the injection point hints!
		ExtensionSorter<ModuleMenuItem> sorter = new ExtensionSorter<>(menuExtensions, items);
		this.items = sorter.sort();
	}
	
	@Override
	@JsonbTransient
	public String getName() {
		return menu;
	}

	public String getEntity() {
		return entity;
	}
	
	
	public String getExpand() {
		return expand;
	}

}
