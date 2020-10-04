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

import static java.util.Collections.emptyList;
import static java.util.Collections.unmodifiableList;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

import io.leitstand.commons.etc.Environment;
import io.leitstand.commons.model.ValueObject;

/**
 * Describes the Leitstand main menu.
 * <p>
 * The {@link MainMenuService} reads the main menu from the <code>main-menu.yaml</code> file specified
 * in the <code>ems.main-menu</code> property or from <code>META-INF/etc</code> if this property is not
 * present.
 * </p>
 * @see Environment
 */
public class MainMenu extends ValueObject{

	private List<MainMenuItem> menu = emptyList();
	
	protected MainMenu() {
		// Tool constructor
	}
	
	protected MainMenu(List<MainMenuItem> items){
		this.menu = new ArrayList<>(items);
	}
	
	/**
	 * Returns the menu items of the EMS main menu as unmodifiable list.
	 * @return the main menu items.
	 */
	public List<MainMenuItem> getItems() {
		return unmodifiableList(menu);
	}
	
	public void addExtensions(List<Extension> extensions) {
		LinkedHashMap<MainMenuItem,ExtensionPoint> points = new LinkedHashMap<>();
		for(Extension extension : extensions) {
			points.put(extension.getItem(),extension.getExtensionPoint());
		}
		menu.addAll(points.keySet());
		
		// Sort all points according to the injection point hints!
		ExtensionSorter<MainMenuItem> sorter = new ExtensionSorter<>(points, menu);
		this.menu = sorter.sort();
	}
	
	public MainMenuItem findWelcomePageModule() {
	    
	    for(MainMenuItem item : menu) {
	        if(item.isWelcomeModule()) {
	            return item;
	        }
	    }

        if(menu.isEmpty()) {
            return null;
        }
	    
	    return menu.get(0);
	    
	}
}
