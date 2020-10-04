package io.leitstand.ui.rs;

import static javax.ws.rs.core.Response.Status.NOT_FOUND;
import static javax.ws.rs.core.Response.Status.OK;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import io.leitstand.ui.model.ModuleDescriptor;
import io.leitstand.ui.model.ModuleDescriptorService;

@RunWith(MockitoJUnitRunner.class)
public class ModuleDescriptorResourceTest {

    
    @Mock
    private ModuleDescriptorService descriptors;
    
    @InjectMocks
    private ModuleDescriptorResource resource = new ModuleDescriptorResource();
    
    @Test
    public void return_not_found_if_module_descriptor_does_not_exist() {
        assertThat(resource.getModuleDescription("unknown").getStatus(),is(NOT_FOUND.getStatusCode()));
    }

    @Test
    public void return_success_if_module_descriptor_exists() {
        ModuleDescriptor descriptor = mock(ModuleDescriptor.class);
        when(descriptors.getModuleDescriptor("module")).thenReturn(descriptor);
        assertThat(resource.getModuleDescription("module").getStatus(),is(OK.getStatusCode()));
    }

    
}
