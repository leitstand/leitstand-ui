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

import static java.util.regex.Pattern.compile;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Pattern;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

/**
 * The <code>ModuleDescriptorServices</code> loads a module descriptor from the file system.
 * <p>
 * The module descriptor is provided as a YAML file. The module service parses the YAML file, creates 
 * a {@link ModuleDescriptor</code>, provides some optimizations and eventually caches the created module descriptor.
 * </p>
 */
@ApplicationScoped
public class ModuleDescriptorService {

	private static final Pattern DYNAMIC_MODULE = compile("\\{\\{.*\\}\\}");
	
	private ConcurrentMap<String,ModuleDescriptor> cache;
	
	@Inject
	private Instance<ModuleDescriptor> modules;
	
	@Inject
	private Contributions contributions;
	
	@PostConstruct
	protected void createModuleCache() {
		cache = new ConcurrentHashMap<>();
		for(ModuleDescriptor module : modules) {
			module.addExtensions(contributions.findExtensions(module));
			applyDefaults(module);
			cache.put(module.getModule(), module);
		}
	}
	
	/**
	 * Returns the module descriptor for the specified module or <code>null</code> if the specified module does not exist.
	 * @param moduleName the module name
	 * @return the module descriptor or <code>null</code> if the module does not exist.
	 */
	public ModuleDescriptor getModuleDescriptor(String moduleName) {
		return cache.get(moduleName);
	}

	protected void applyDefaults(ModuleDescriptor descriptor) {
		// Push down menu query settings to all menu items to facilitate 
		// module descriptor processing in the browser.
		for(ModuleMenu menu : descriptor.getMenus()) {
			for(ModuleMenuItem item: menu.getItems()) {
				item.addQueryParameters(menu.getQuery());
				// If item refers to a submodule, add this module to the includes section!
				int slash = item.getView().lastIndexOf('/');
				if(slash < 0) {
					continue;
				}
				String module = item.getView().substring(0,slash);
				if(isDynamicModule(module)) {
					continue;
				}
			}
		}
	}

	static boolean isDynamicModule(String module) {
		return DYNAMIC_MODULE.matcher(module).matches();
	}
	
}