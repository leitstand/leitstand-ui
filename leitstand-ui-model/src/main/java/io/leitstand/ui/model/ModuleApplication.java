/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;

/**
 * Module application descriptor.
 * <p>
 * The module application descriptor sets the name of an application and the application controller file,
 * Moreover, the application descriptor <code>defer</code> flag states whether to load the application eagerly or on demand.
 */
public class ModuleApplication {

	public static class Builder {
		private ModuleApplication module = new ModuleApplication();
			
		public Builder withApplicationName(String application) {
			assertNotInvalidated(getClass(), module);
			module.application = application;
			return this;
		}
		
		public Builder withController(String controller) {
			assertNotInvalidated(getClass(), module);
			module.controller = controller;
			return this;
		}
		
		public Builder withDefer(boolean defer) {
			assertNotInvalidated(getClass(), module);
			module.defer = defer;
			return this;
		}
		
		public ModuleApplication build() {
			try {
				assertNotInvalidated(getClass(), module);
				return module;
			} finally {
				this.module = null;
			}
		}
		
	}

	private String application;
	private String controller = "controller.js";
	private boolean defer;
	
	/**
	 * Returns the application name.
	 * @return the application name.
	 */
	public String getApplication() {
		return application;
	}
	
	/**
	 * The controller file name.
	 * @return the controller file name.
	 */
	public String getController() {
		return controller;
	}
	
	/**
	 * Returns whether this application shall be loeaded on demand or eagerly.
	 * @return <code>true</code> when this application shall be loaded on demand, <code>false</code> if the application shall be loaded at the moment when the module is loaded.
	 */
	public boolean isDefer() {
		return defer;
	}
	
}
