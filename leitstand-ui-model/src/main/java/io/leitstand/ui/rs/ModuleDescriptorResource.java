/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.rs;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.Response.ok;
import static javax.ws.rs.core.Response.status;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import io.leitstand.ui.model.ModuleDescriptor;
import io.leitstand.ui.model.ModuleDescriptorService;

/**
 * Provides readonly access to all available module descriptors.
 * @see ModuleDescriptor
 * @see ModuleDescriptorService
 */
@RequestScoped
@Path("/ui")
public class ModuleDescriptorResource {

	@Inject
	private ModuleDescriptorService service;
	
	/**
	 * Returns the {@link ModuleDescriptor} for the specified module.
	 * @param request - the current HTTP request
	 * @param module - the module name
	 * @return the module descriptor adaptToJsonled in JSON or <code>404 Not Found</code> if the requested module does not exist.
	 */
	@GET
	@Path("/modules/{module}")
	@Produces(APPLICATION_JSON)
	public Response getModuleDescription(@PathParam("module") String module) {
		ModuleDescriptor md = service.getModuleDescriptor(module);
		if(md == null) {
			return status(NOT_FOUND).build();
		}
		return ok(md, APPLICATION_JSON).build();
		
	}
	
}
