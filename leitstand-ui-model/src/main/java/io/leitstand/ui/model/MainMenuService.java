/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
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
