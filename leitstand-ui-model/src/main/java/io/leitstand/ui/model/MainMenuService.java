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

import static io.leitstand.commons.etc.FileProcessor.yaml;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import io.leitstand.commons.etc.Environment;

/**
 * Loads the {@link MainMenu} from the YAML file specified in the <code>ems.main-menu</code> property or
 * from <code>META-INF/etc/main-menu.yaml</code> if this property is not present.
 */
@ApplicationScoped
public class MainMenuService {

	@Inject
	private Environment env;
	@Inject
	private Contributions extensions;
	
	private MainMenu menu;
	
	protected MainMenuService() {
		// CDI constructor
	}
	
	@PostConstruct
	protected void loadMainMenu() {

		menu = env.loadFile("/META-INF/resources/ui/modules/main-menu.yaml", 
							yaml(MainMenu.class));		
		
		menu.addExtensions(extensions.findExtensions());
	
	}
	
	/**
	 * Returns the Leitstand main menu.
	 * @return the Leitstand main menu.
	 */
	public MainMenu getMainMenu() {
		return menu;
	}

	
}
