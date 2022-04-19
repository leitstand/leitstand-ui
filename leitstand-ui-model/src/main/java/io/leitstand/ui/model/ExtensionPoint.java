package io.leitstand.ui.model;

import static java.lang.String.format;

class ExtensionPoint {

	private String module;
	private String menu;
	private String after;
	private String before;
	
	ExtensionPoint module(String module){
		this.module = module;
		return this;
	}
	
	ExtensionPoint menu(String menu) {
		this.menu = menu;
		return this;
	}
	
	ExtensionPoint after(String after) {
		this.after = after;
		return this;
	}
	
	ExtensionPoint before(String before) {
		this.before = before;
		return this;
	}
	
	String getMenu() {
		return menu;
	}
	
	String getModule() {
		return module;
	}
	
	String getAfter() {
		return after;
	}
	
	String getBefore() {
		return before;
	}
	
	boolean isModuleExtension() {
		return module != null && menu == null;
	}
	
	boolean isModuleMenuExtension() {
		return module != null && menu != null;
	}
	
	@Override
	public String toString() {
	    return format("ExtensionPoint [module=%s, menu=%s, after=%s, before=%s]", 
	                  module,
	                  menu, 
	                  after, 
	                  before);
	}
	
}
