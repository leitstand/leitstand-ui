/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.rs;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import io.leitstand.ui.model.MainMenu;
import io.leitstand.ui.model.MainMenuItem;
import io.leitstand.ui.model.MainMenuService;

/**
 * Provides readonly access to the Leitstand {@link MainMenu}.
 * 
 * @see MainMenuService
 * @see MainMenu
 */
@RequestScoped
@Path("/ui")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
public class MainMenuResource {

	@Inject
	private MainMenuService menu;
	
	/**
	 * Returns the Leitstand main menu.
	 * @return the main menu items.
	 */
	@GET
	@Path("/modules")
	public List<MainMenuItem> getMainMenu() {
		return menu.getMainMenu().getItems();
	}

}