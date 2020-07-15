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
import static io.leitstand.commons.model.StringUtil.isEmptyString;
import static java.util.regex.Pattern.compile;

import java.util.regex.Pattern;

import javax.json.bind.annotation.JsonbTransient;


/**
 * Module menu item.
 */
public class ModuleMenuItem extends BaseModuleItem {

	private static final Pattern ABSOLUTE = compile("^(?:[a-z]+\\:\\/)?\\/");
	
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
	public static class Builder extends BaseBuilder<ModuleMenuItem,Builder> {
		
		protected Builder() {
			super(new ModuleMenuItem());
		}
		
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
		 * Sets the optional view target for this menu item.
		 * @param target the view target
		 * @return a referemce to this builder to continue with object creation.
		 */
		public Builder withTarget(String target) {
			assertNotInvalidated(getClass(), item);
			item.target = target;
			return this;
		}
		
		public ModuleMenuItem build() {
			try {
				assertNotInvalidated(getClass(), item);
				if(isEmptyString(item.getLabel())) {
					withLabel(item.getItem());
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
	private String view;
	private String target;
	
	/**
	 * Returns the name of the menu item.
	 * @return the name of the menu item.
	 */
	public String getItem() {
		return item;
	}
	
	/**
	 * Returns the view template path.
	 * @return the view template path.
	 */
	public String getView() {
		return view;
	}
	
	/**
	 * Returns the view target.
	 * @return the view target or <code>null</code> if no target is specified.
	 */
	public String getTarget() {
		return target;
	}
	
	@Override
	@JsonbTransient
	public String getName() {
		return item;
	}

	void applyBaseUri(String baseUrl) {
		if(baseUrl == null || ABSOLUTE.matcher(view).find()) {
			// No base URL or view is already an absolute path (/...) or a full qualified URI (http://..., https://...)
			return;
		}
		this.view = baseUrl+"/"+view;
	}
	
}
