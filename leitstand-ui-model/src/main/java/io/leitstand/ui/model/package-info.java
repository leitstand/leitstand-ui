/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
/**
 * The <code>net.rtbrick.rbms.ui.model</code> package contains all entities to describe a UI module and the UI main menu.
 * The {@link MainMenuService} loads the EMS {@link MainMenu}
 * <p>
 * The EMS UI is a modularized single page application that fully operates on top of the EMS REST API.
 * The {@link ModuleDescriptorService} loads a {@link ModuleDescriptor} from its corresponding YAML file.
 * </p>
 * <p>
 * The EMS REST API is formed by the entirety of all APIs of all EMS modules and applications. 
 * The EMS REST API is therefore subject of changes by means of adding, updating or removing 
 * applications or modules.  Every EMS module and EMS application can contribute UI components.
 * Consequently, the EMS UI consists of modules and applications too.
 * </p>
 */
package io.leitstand.ui.model;