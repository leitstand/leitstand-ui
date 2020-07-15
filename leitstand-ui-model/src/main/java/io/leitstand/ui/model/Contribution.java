
package io.leitstand.ui.model;

import static io.leitstand.commons.etc.FileProcessor.yaml;
import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;
import static io.leitstand.commons.model.ObjectUtil.asSet;
import static java.util.Collections.emptyList;
import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;

import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.enterprise.inject.Typed;

@Typed
public class Contribution {
	
	public static Builder newContribution() {
		return new Builder();
	}
	
	public static Builder loadContribution(URL url) throws IOException{
		Builder builder = new Builder();
		builder.contrib = yaml(Contribution.class).process(url);
		return builder;
	}
	
	
	public static class Builder {
		private Contribution contrib = new Contribution();
		
		public Builder withBaseUri(String baseUri) {
			assertNotInvalidated(getClass(), contrib);
			contrib.baseUri = baseUri;
			return this;
		}

		public Builder withController(String controller) {
			assertNotInvalidated(getClass(), contrib);
			contrib.controller = controller;
			return this;
		}
		
		public Builder withProvider(String provider) {
			assertNotInvalidated(getClass(), contrib);
			contrib.provider = provider;
			return this;
		}
		
		public Builder withName(String name) {
			assertNotInvalidated(getClass(), contrib);
			contrib.name = name;
			return this;
		}
		
		public Builder withDescription(String description) {
			assertNotInvalidated(getClass(), contrib);
			contrib.description = description;
			return this;
		}
		
		public Builder withCategory(String category) {
			assertNotInvalidated(getClass(), contrib);
			contrib.category = category;
			return this;
		}
		
		public Builder withScopesAllowed(String... scopes) {
			return withScopesAllowed(asSet(scopes));
		}
		
		public Builder withScopesAllowed(Set<String> scopes) {
			assertNotInvalidated(getClass(), contrib);
			contrib.scopesAllowed = new TreeSet<>(scopes);
			return this;
		}
		
		public Builder withConfig(Map<String,Object> config) {
			assertNotInvalidated(getClass(), contrib);
			contrib.config = new TreeMap<>(config);
			return this;
		}
		
		public Contribution build() {
			try {
				assertNotInvalidated(getClass(),contrib);
				return applyDefaults(contrib);
			} finally {
				this.contrib = null;
			}
		}
	
	}
	
	static Contribution applyDefaults(Contribution contribution) {
		for(Extension extension : contribution.getExtensions()) {
			for(ModuleMenuItem menuItem : extension.getItems()) {
				menuItem.setCategory(contribution.getCategory());
				menuItem.addConfig(contribution.getConfig());
				menuItem.addScopesAllowed(contribution.getScopesAllowed());
				menuItem.applyBaseUri(contribution.getBaseUri());
			}
			for(ModuleMenu menu : extension.getMenus()) {
				menu.addConfig(contribution.getConfig());
				menu.addScopesAllowed(contribution.getScopesAllowed());
				for(ModuleMenuItem menuItem : menu.getItems()) {
					menuItem.setCategory(contribution.getCategory());
					menuItem.addConfig(contribution.getConfig());
					menuItem.addScopesAllowed(contribution.getScopesAllowed());
					menuItem.applyBaseUri(contribution.getBaseUri());
				}
			}
		}
		return contribution;
		
	}

	private String baseUri;
	private String name;
	private String provider;
	private String description;
	private String category;
	private String controller;
	private Set<String> scopesAllowed;
	private Map<String,Object> config;
	
	private List<Extension> extensions = emptyList();
	
	public List<Extension> getExtensions() {
		return unmodifiableList(extensions);
	}
	
	public String getName() {
		return name;
	}
	
	public String getProvider() {
		return provider;
	}
	
	public String getDescription() {
		return description;
	}
	
	public String getController() {
		return controller;
	}
	
	public Set<String> getScopesAllowed() {
		if(scopesAllowed == null || scopesAllowed.isEmpty()) {
			return null;
		}
		return unmodifiableSet(scopesAllowed);
	}
	
	public Map<String, Object> getConfig() {
		if(config == null || config.isEmpty()) {
			return null;
		}
		return unmodifiableMap(config);
	}
	
	public String getCategory() {
		return category;
	}
 	
 	public boolean isNewModule() {
 		return extensions.stream().anyMatch(Extension::isMainMenuItem);
 	}
 	
 	public boolean contributesTo(ModuleDescriptor module) {
 		return extensions.stream().anyMatch(e -> e.isExtensionFor(module));
 	}
 	
 	public String getBaseUri() {
		return baseUri;
	}
 	
}
