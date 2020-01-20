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
	
	private ConcurrentMap<String,ModuleDescriptor> CACHE;
	
	@Inject
	private ModuleDescriptorLoader loader;
	
	@PostConstruct
	protected void initModuleCache() {
		CACHE = new ConcurrentHashMap<>();
	}
	
	
	
	/**
	 * Returns the module descriptor for the specified module or <code>null</code> if the specified module does not exist.
	 * @param context - the current context
	 * @param moduleName - the module name
	 * @return the module descriptor or <code>null</code> if the requested module does not exist.
	 */
	public ModuleDescriptor getModuleDescriptor(String moduleName) {

		ModuleDescriptor descriptor =  CACHE.get(moduleName);
		if(descriptor != null) {
			return descriptor;
		}
		
		descriptor = loader.loadModuleDescriptor(moduleName);
		if(descriptor == null) {
			// The requested module does not exist!
			return null;
		}
		
		optimizeModuleDescriptor(descriptor);
		
		return cacheModuleDescriptor(moduleName, 
									descriptor);
	}

	private ModuleDescriptor cacheModuleDescriptor(String moduleName, 
												   ModuleDescriptor descriptor) {
		// putIfAbsent returns null, if no cache entry was present. 
		// Instead of a null check (and return of descriptor instead the null value), 
		// a second CACHE lookup is preferred. This improves readability and is not performance
		// relevant as creating a new descriptor is the exceptional branch.
		CACHE.putIfAbsent(moduleName, descriptor);
		return CACHE.get(moduleName);
	}

	protected void optimizeModuleDescriptor(ModuleDescriptor descriptor) {
		// Push down menu query settings to all menu items to facilitate 
		// module descriptor processing in the browser.
		for(ModuleMenu menu : descriptor.getNavigation()) {
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
