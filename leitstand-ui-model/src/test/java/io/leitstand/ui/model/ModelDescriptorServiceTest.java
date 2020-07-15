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

import static io.leitstand.ui.model.ModuleDescriptor.newModuleDescriptor;
import static io.leitstand.ui.model.ModuleMenu.newModuleMenu;
import static io.leitstand.ui.model.ModuleMenuItem.newModuleMenuItem;
import static java.util.Collections.emptyList;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.HashMap;

import javax.enterprise.inject.Instance;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ModelDescriptorServiceTest {

	private ModuleDescriptor descriptor;
	@Mock
	private Instance<ModuleDescriptor> module;
	
	@Mock
	private Contributions contributions;
	
	@InjectMocks
	private ModuleDescriptorService service = new ModuleDescriptorService();
	
	@Before
	public void initCache() {
		when(module.iterator()).thenReturn(Collections.<ModuleDescriptor>emptyList().iterator());
		service.createModuleCache(); 
	}
	
	@Test
	public void propagate_menu_query_to_item_without_query() {
		descriptor = newModuleDescriptor()
					.withName("unittest")
					.withMenus(newModuleMenu()
							   		.withName("menu")
							   		.withQuery(new HashMap<String,String>() {{
							   			put("a","a");
							   			put("b","b");
							   		}})
							   		.withItems( newModuleMenuItem()
							   					.withName("unit under test")
							   					.withView("noquery")))
					.build();
		
		service.applyDefaults(descriptor);
		ModuleMenu menu = descriptor.getMenus().get(0);
		assertEquals(menu.getQuery(), menu.getItems().get(0).getQuery());
	}
	 
	@Test
	public void item_query_overrides_menu_query() {
		descriptor = newModuleDescriptor()
				.withName("unittest")
				.withMenus(newModuleMenu()
						   		.withName("menu")
						   		.withQuery(new HashMap<String,String>() {{
						   			put("a","a");
						   			put("b","b");
						   		}})
						   		.withItems( newModuleMenuItem()
						   					.withName("unit under test")
						   					.withView("overriden")
						   					.withQuery(new HashMap<String,String>(){{
						   						put("a","A");
						   						put("c","c");
						   					}})))
				.build();
		
		
		service.applyDefaults(descriptor);
		ModuleMenuItem item = descriptor.getMenus().get(0).getItems().get(0);
		assertEquals("A",item.getQuery().get("a"));
		assertEquals("b",item.getQuery().get("b"));
		assertEquals("c",item.getQuery().get("c"));
	}
	
}
