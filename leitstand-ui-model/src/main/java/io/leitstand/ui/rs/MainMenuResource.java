/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.rs;

import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.leitstand.ui.model.MainMenu;
import io.leitstand.ui.model.MainMenuItem;
import io.leitstand.ui.model.MainMenuService;

/**
 * Provides readonly access to the EMS {@link MainMenu}.
 * 
 * @see MainMenuService
 * @see MainMenu
 */
@RequestScoped
@Path("/ui")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class MainMenuResource {

	@Inject
	private MainMenuService menu;
	
	/**
	 * Returns the EMS main menu.
	 * @return the main menu items.
	 */
	@GET
	@Path("/modules")
	public List<MainMenuItem> getMainMenu() {
		return menu.getMainMenu().getItems();
	}

}