package io.leitstand.ui.model;

import static io.leitstand.commons.etc.FileProcessor.yaml;
import static io.leitstand.ui.model.ModuleApplication.newModuleApplication;
import static java.util.Collections.unmodifiableList;
import static java.util.stream.Collectors.toList;

import java.util.LinkedList;
import java.util.List;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

import io.leitstand.commons.StartupListener;
import io.leitstand.commons.etc.Environment;

@ApplicationScoped
public class Contributions implements StartupListener{
	
	private List<Contribution> contributions;
	
	@Inject
	private Instance<Contribution> builtinContributions;
	
	@Inject
	private Environment env;
	
	@Override
	public void onStartup() {
		
		this.contributions = new LinkedList<>();
	
		// Load internal contributions
		this.contributions.addAll(builtinContributions.stream().collect(toList()));
		
			
		// Load external contributions from file system.
		this.contributions.addAll(env.loadConfigs("ui/contrib", 
											 	  f -> f.canRead() && f.isFile(), 
											 	  yaml(Contribution.class))
									 .stream()
									 .map(Contribution::applyDefaults)
									 .collect(toList()));
		
	}

	public List<Extension> findExtensions(ModuleDescriptor module){
		List<Extension> extensions = new LinkedList<>();
		
		for(Contribution contrib : contributions) {
			if(contrib.contributesTo(module)) {
				// Register contributed menus and items
				for(Extension extension : contrib.getExtensions()) {
					if(extension.isExtensionFor(module)) {
						extensions.add(extension);
					}
				}
				// Register bootstrapper
				ModuleApplication app = newModuleApplication()
										.withApplicationName(contrib.getName())
										.withDefer(false)
										.withController(contrib.getBaseUri()+"/"+contrib.getController())
										.build();
				
				module.addApplication(app);
			}
		}
		return unmodifiableList(extensions);
	}

	public List<Extension> findExtensions() {
		List<Extension> extensions = new LinkedList<>();
		for(Contribution contrib : contributions) {
			if(contrib.isNewModule()) {
				extensions.addAll(contrib.getExtensions()
										 .stream()
										 .filter(Extension::isMainMenuItem)
										 .collect(toList()));
			}
		}
		return extensions;
	}
	
}
