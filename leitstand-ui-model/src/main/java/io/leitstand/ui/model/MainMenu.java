/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static java.util.Collections.emptyList;
import static java.util.Collections.unmodifiableList;

import java.util.ArrayList;
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
}