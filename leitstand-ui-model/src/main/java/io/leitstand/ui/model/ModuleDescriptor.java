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

import static io.leitstand.commons.etc.FileProcessor.yaml;
import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;
import static io.leitstand.commons.model.BuilderUtil.requires;
import static io.leitstand.commons.model.ObjectUtil.asSet;
import static io.leitstand.commons.model.StringUtil.isNonEmptyString;
import static io.leitstand.ui.model.ModuleApplication.newModuleApplication;
import static java.util.Arrays.asList;
import static java.util.Arrays.stream;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptySet;
import static java.util.Collections.emptySortedSet;
import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableSet;
import static java.util.stream.Collectors.toList;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.json.bind.annotation.JsonbTransient;


/**
 * The <code>ModuleDescriptor</code> describes a UI module.
 * <p>
 * Every module requires a unique name and a non-empty list of menus.
 * All other properties are optional.
 * </p>
 * <p>
 * The {@link ModuleDescriptorService} loads the <code>ModuleDescriptor</code> 
 * from the <code>module.yaml</code> file in the module directory.
 * </p>
 */
public class ModuleDescriptor {
		
	/**
	 * Returns a new builder to create an immutable <code>ModuleDescriptor</code> instance.
	 * @return a new <code>ModuleDescriptor</code> builder
	 */
	public static Builder newModuleDescriptor() {
		return new Builder();
	}
	
	public static Builder readModuleDescriptor(URL descriptor) throws IOException {
		Builder builder = new Builder();
		builder.descriptor = yaml(ModuleDescriptor.class).process(descriptor);
		return builder;
	}
	
	/**
	 * The builder for an immutable <code>ModuleDescriptor</code> instance.
	 */
	public static class Builder {
		
		private ModuleDescriptor descriptor = new ModuleDescriptor();
		private List<Contribution> contributions = emptyList();
		
		/**
		 * Sets the module name.
		 * @param name the module name
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withName(String name) {
			assertNotInvalidated(getClass(), descriptor);
			descriptor.module = name;
			return this;
		}
		
		/**
		 * Sets the paths of all submodules that have to be loaded as part of this module.
		 * @param applications the submodules to be included.
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withApplications(ModuleApplication.Builder... applications) {
			return withApplications(stream(applications)
									.map(ModuleApplication.Builder::build)
									.collect(toList()));
		}

		/**
		 * Sets the paths of all submodules that have to be loaded as part of this module.
		 * @param applications the submodules to be included.
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withApplications(Collection<ModuleApplication> applications) {
			assertNotInvalidated(getClass(), descriptor);
			descriptor.applications = new TreeSet<ModuleApplication>((a,b) -> a.getApplication().compareTo(b.getApplication()));
			descriptor.applications.addAll(applications);
			return this;
		}
		
		public Builder withContributions(Contribution... contributions) {
			return withContributions(asList(contributions));
		}
		
		public Builder withContributions(List<Contribution> contributions) {
			assertNotInvalidated(getClass(), descriptor);
			this.contributions = new ArrayList<>(contributions);
			return this;
		}
		
		/**
		 * Sets the module menus
		 * @param builder the builders for all module menus
		 * @return a reference to this builder to continue with object creation.
		 */
		
		public Builder withMenus(ModuleMenu.Builder...builder) {
			return withNavigation(stream(builder)
								 .map(ModuleMenu.Builder::build)
								 .collect(toList()));
		}
		
		
		/**
		 * Sets the module menus
		 * @param menus all menus of this module
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withMenus(ModuleMenu...menus) {
			return withNavigation(asList(menus));
		}
		
		/**
		 * Sets the scopes that are allowed to this module.
		 * @param scopes the scopes that are allowed to access this module
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withScopesAllowed(String... scopes) {
			return withScopesAllowed(asSet(scopes));
		}
		
		
		/**
		 * Sets the scopes that are allowed to access this module.
		 * @param scopes the scopes that are allowed to access this module
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withScopesAllowed(Set<String> roles) {
			descriptor.scopesAllowed = unmodifiableSet(new TreeSet<>(roles));
			return this;
		}
		
		/**
 		 * Sets the module navigation
		 * @param menus all menus of this module
		 * @return a reference to this builder to continue with object creation.
		 */
		public Builder withNavigation(List<ModuleMenu> menus) {
			assertNotInvalidated(getClass(), descriptor);
			descriptor.menus = new ArrayList<>(menus);
			return this;
		}
		
		/**
		 * Returns the module descriptor and invalidates itself. 
		 * Any further interaction with this builder raises an exception.
		 * @return the immutable <code>ModuleDescriptor</code> instance.
		 */
		public ModuleDescriptor build() {
			try {
				assertNotInvalidated(getClass(), descriptor);
				requires(getClass(), "name", descriptor.module);
				requires(getClass(), "navigation", descriptor.menus);
				contributions.stream()
						     .filter(c -> c.contributesTo(descriptor))
						     .forEach(c -> {
								 descriptor.addApplication(newModuleApplication()
										                   .withApplicationName(isNonEmptyString(c.getName()) ? c.getName() : c.getBaseUri())
										                   .withController(c.getBaseUri()+"/"+c.getController())
										                   .build());
								 descriptor.addExtensions(c.getExtensions());
							 });
				
				return descriptor;
			} finally {
				descriptor = null;
			}
		}
		
	}
	
	

	private String module;
	private Set<ModuleApplication> applications = emptySet();
	private List<ModuleMenu> menus = emptyList();
	@JsonbTransient
	private Map<ModuleMenu,List<ExtensionPoint>> moduleExtensions = new LinkedHashMap<>();
	private Set<String> scopesAllowed;

	/**
	 * Returns the module name.
	 * The module name is unique for all existing modules.
 	 * @return the name of the module.
	 */
	public String getModule() {
		return module;
	}
	
	/**
	 * Returns the set of applications to be included for this module.
	 * @return the list of applications to be included for this module.
	 */
	public Set<ModuleApplication> getApplications() {
		return unmodifiableSet(applications);
	}
	
	/**
	 * Returns the set of scopes allowed to access this module.
	 * Returns an empty set if any scope can access this module.
	 * @return the set of scopes allowed to access this module.
	 */
	public Set<String> getScopesAllowed() {
		if(scopesAllowed == null) {
			return emptySortedSet();
		}
		return unmodifiableSet(scopesAllowed);
	}
	
	/**
	 * Return the navigation of this module. 
	 * The navigation consist of a set of menus, 
	 * which are enabled depending on the data currently being displayed.
	 * @return the menus of this module
	 */
	public List<ModuleMenu> getMenus() {
		return unmodifiableList(menus);
	}

	void addExtensions(Extension... extensions) {
		addExtensions(asList(extensions));
	}
	
	void addExtensions(List<Extension> extensions) {
		// Add all menus
        Set<ModuleMenu> newMenus = new LinkedHashSet<>();
		for(Extension extension : extensions) {
			if(extension.isModuleExtension()) {
				ExtensionPoint point = extension.getExtensionPoint();
				for(ModuleMenu menu : extension.getMenus()) {
				    List<ExtensionPoint> points = moduleExtensions.computeIfAbsent(menu, m -> new LinkedList<>());
                    points.add(point);
                    newMenus.add(menu);
				}
			}
		}
		
		this.menus.addAll(newMenus);
		// Rearrange all menus according to the after and before constraints
		ExtensionSorter<ModuleMenu> sort = new ExtensionSorter<>(moduleExtensions,this.menus);
		this.menus = sort.sort(); 
		
		// Add all menu contributions
		for(ModuleMenu menu : this.menus) {
			menu.addExtensions(extensions
							   .stream()
							   .filter(Extension::isModuleMenuExtension)
							   .filter(c -> menu.getName().equals(c.getExtensionPoint().getMenu()))
							   .collect(toList()));
		}
		
	}

	void addApplication(ModuleApplication app) {
		if(this.applications.isEmpty()) {
			// Empty set is immutable
			this.applications = new LinkedHashSet<>();
		}
		this.applications.add(app);
	}
	
	
}
