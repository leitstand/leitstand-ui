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
import static io.leitstand.commons.model.ObjectUtil.asSet;
import static java.util.Collections.emptySortedSet;
import static java.util.Collections.unmodifiableSortedSet;

import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

import io.leitstand.commons.model.ValueObject;


/**
 * A menu item of the EMS main menu.
 */
public class MainMenuItem extends ValueObject{

	/**
	 * Returns a builder to create an immutable main menu item.
	 * @return a builder to create an main menu item.
	 */
	public static Builder newModuleMenuItem() {
		return new Builder();
	}
	
	/**
	 * A builder to create an immutable <code>MainMenuItem</code> instance.
	 */
	public static class Builder {
		
		private MainMenuItem item = new MainMenuItem();
		
		/**
		 * Sets the module represented by this main menu item.
		 * @param module - the module name.
		 * @return a reference to this Builder to continue with object creation
		 */
		public Builder withModule(String module) {
			assertNotInvalidated(getClass(), item);
			item.module = module;
			return this;
		}

		/**
		 * Sets the module title to be displayed in the EMS UI.
		 * @param title - the module title.
		 * @return a reference to this Builder to continue with object creation
		 */

		public Builder withTitle(String title) {
			assertNotInvalidated(getClass(), item);
			item.title = title;
			return this;
		}
		
		/**
		 * Sets an optional module subtitle to be displayed in the EMS UI.
		 * @param subtitle - the module subtitle..
		 * @return a reference to this Builder to continue with object creation
		 */

		public Builder withSubtitle(String subtitle) {
			assertNotInvalidated(getClass(), item);
			item.subtitle = subtitle;
			return this;
		}
		
		/**
		 * Sets the label of this menu item in the main menu.
		 * @param label - the label.
		 * @return a reference to this Builder to continue with object creation
		 */

		public Builder withLabel(String label) {
			assertNotInvalidated(getClass(), item);
			item.label = label;
			return this;
		}
		
		/**
		 * Sets the host absolute path to the UI module represented by this main menu item.
		 * @param path - the module path.
		 * @return a reference to this Builder to continue with object creation
		 */
		public Builder withPath(String path) {
			assertNotInvalidated(getClass(), item);
			item.path = path;
			return this;
		}
		
		/**
		 * Adds the scopes that are allowed to access this menu item.
		 * @param scopes the scopes
		 * @return a reference to this Builder to continue with object creation
		 */
		public Builder withScopesAllowed(String... scopes) {
			return withScopesAllowed(asSet(scopes));
		}

		/**
		 * Adds the scopes that are allowed to access this menu item.
		 * @param scopes the scopes
		 * @return a reference to this Builder to continue with object creation
		 */
		public Builder withScopesAllowed(Set<String> scopes) {
			item.scopesAllowed = new TreeSet<String>(scopes);
			return this;
		}
		
		/**
		 * Returns an immutable <code>MainMenuItem</code> instance and invalidates this builder.
		 * Any further interaction with this builder raises an exception.
		 * @return an immutable <code>MainMenuItem</code> instance.
		 */
		public MainMenuItem build() {
			try {
				assertNotInvalidated(getClass(), item);
				requires(getClass(), "module", item.module);
				requires(getClass(), "label", item.label);
				requires(getClass(), "module", item.module);
				requires(getClass(), "path", item.path);
				requires(getClass(), "title", item.title);
				return item;
			} finally {
				this.item = null;
			}
		}
	}
	
	private String module;
	private String title;
	private String subtitle;
	private String label;
	private String path;
	private String position;
	private SortedSet<String> scopesAllowed = emptySortedSet();
	
	/**
	 * Returns the name of the module represented by this menu item.
	 * @return the module name.
	 */
	public String getModule() {
		return module;
	}
	
	/**
	 * Returns the title of the module, which is displayed as headline in the EMS UI.
	 * @return the module title.
	 */
	public String getTitle() {
		return title;
	}
	
	/**
	 * Returns the subtitle of this module, which is displayed as subtitle in the EMS UI 
	 * and also used as tooltip for the main menu item.
	 * @return the module subtitle.
	 */
	public String getSubtitle() {
		return subtitle;
	}
	
	/**
	 * Returns the label of the main menu item.
	 * @return the label of the module.
	 */
	public String getLabel() {
		return label;
	}
	
	/**
	 * Returns the host absolute path of the module represented by this menu item.
	 * @return the module path.
	 */
	public String getPath() {
		return path;
	}
	
	public String getPosition() {
		return position;
	}
	
	public SortedSet<String> getScopes() {
		return unmodifiableSortedSet(scopesAllowed);
	}
	
}
