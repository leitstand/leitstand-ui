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
import static java.lang.String.format;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import io.leitstand.commons.etc.Environment;

/**
 * Loads the {@link MainMenu} from the YAML file specified in the <code>ems.main-menu</code> property or
 * from <code>META-INF/etc/main-menu.yaml</code> if this property is not present.
 * @author mast
 *
 */
@ApplicationScoped
public class MainMenuService {

	private Environment env;
	
	private MainMenu menu;
	
	protected MainMenuService() {
		// CDI constructor
	}
	
	/**
	 * Create a <code>MainMenuService</code>.
	 * @param env - the current EMS environment
	 */
	@Inject
	protected MainMenuService(Environment env) {
		this.env = env;
	}
	
	@PostConstruct
	protected void loadMainMenu() {
		String mainMenuPath = format("%s/module/main-menu.yaml",
									 env.getSettings().getUIModulesDir());

		menu = env.loadFile(mainMenuPath, 
							yaml(MainMenu.class));		
	}
	
	/**
	 * Returns the EMS main menu.
	 * @return the EMS main menu.
	 */
	public MainMenu getMainMenu() {
		return menu;
	}

	
}
