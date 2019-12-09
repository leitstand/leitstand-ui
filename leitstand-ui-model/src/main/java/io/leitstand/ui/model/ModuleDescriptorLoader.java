/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static io.leitstand.commons.etc.FileProcessor.yaml;
import static java.lang.String.format;
import static java.lang.Thread.currentThread;
import static java.util.logging.Level.FINE;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.util.logging.Logger;

import javax.enterprise.context.Dependent;
import javax.inject.Inject;

import io.leitstand.commons.etc.Environment;

@Dependent
class ModuleDescriptorLoader {
	
	private static final Logger LOG = Logger.getLogger(ModuleDescriptorLoader.class.getName());
	
	@Inject
	private Environment env;

	ModuleDescriptor loadModuleDescriptor(String moduleName) {
		try {
			String moduleDescriptorPath = format("%s/ui/modules/%s/module.yaml",
												 env.getSettings().getUiModulesDir(),
												 moduleName);

			URL moduleDescriptorUrl = openUrl(moduleDescriptorPath);

			if(moduleDescriptorUrl == null) {
				String msg = format("Unknown UI module %s requested!",
								    moduleName);
				LOG.log(FINE,msg);
				return null;
			}
			
			return yaml(ModuleDescriptor.class)
				   .process(moduleDescriptorUrl);
			
		} catch (IOException e) {
			String msg = format("IO error while loading descriptor for module %s: %s ",
								moduleName, 
								e.getMessage());
			LOG.log(FINE,msg,e);
			throw new UncheckedIOException(msg,e);
		}
	}
	
	URL openUrl(String path){
		return currentThread()
			   .getContextClassLoader()
			   .getResource(path);
	}
	
}
