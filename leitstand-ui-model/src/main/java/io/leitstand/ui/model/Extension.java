package io.leitstand.ui.model;

import static java.lang.String.format;
import static java.util.Collections.emptyList;

import java.util.List;

class Extension {
	private ExtensionPoint extend;
	private List<ModuleMenu> menus = emptyList();
	private List<ModuleMenuItem> items = emptyList();
	private MainMenuItem mainMenu;

	public ExtensionPoint getExtensionPoint() {
		return extend;
	}
	
	List<ModuleMenu> getMenus() {
		return menus;
	}

	List<ModuleMenuItem> getItems() {
		return items;
	}
	
	boolean isMainMenuItem() {
		return mainMenu != null;
	}

	boolean isModuleMenuExtension(){
		return extend.isModuleMenuExtension() && !items.isEmpty();
	}
	
	boolean isModuleExtension() {
		return extend.isModuleExtension() && !menus.isEmpty();
	}

	public boolean isExtensionFor(ModuleDescriptor descriptor) {
		return descriptor.getModule().equals(extend.getModule());
	}

	public MainMenuItem getItem() {
		return mainMenu;
	}
	
	@Override
	public String toString() {
	    return format("Extension[point=%s, is_module_extension=%s, is_menu_exteion=%s]",extend,isModuleExtension(),isModuleMenuExtension());
	}
}
