package io.leitstand.ui.model;

import static io.leitstand.ui.model.ModuleMenuItem.newModuleMenuItem;
import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class ModuleMenuItemTest {

	@Test
	public void apply_base_path_to_relative_path() {
		ModuleMenuItem item = newModuleMenuItem()
							  .withName("dummy")
							  .withView("test.html")
							  .build();
		item.applyBaseUri("/base");
		assertEquals("/base/test.html",item.getView());
	}

	@Test
	public void dont_apply_base_path_to_absolute_path() {
		ModuleMenuItem item = newModuleMenuItem()
							  .withName("dummy")
							  .withView("/base/test.html")
							  .build();
		item.applyBaseUri("/base");
		assertEquals("/base/test.html",item.getView());
	}

	@Test
	public void dont_apply_base_path_to_full_qualified_url() {
		ModuleMenuItem item = newModuleMenuItem()
							  .withName("dummy")
							  .withView("http://localhost:8080/base/test.html")
							  .build();
		item.applyBaseUri("/base");
		assertEquals("http://localhost:8080/base/test.html",item.getView());
	}
	
	@Test
	public void donothing_when_base_path_is_null() {
		ModuleMenuItem item = newModuleMenuItem()
							  .withName("dummy")
							  .withView("test.html")
							  .build();
		item.applyBaseUri(null);
		assertEquals("test.html",item.getView());
	}
	
}
