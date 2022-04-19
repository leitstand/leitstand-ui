package io.leitstand.ui.rs;

import java.util.Set;
import java.util.SortedSet;

import javax.inject.Inject;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import io.leitstand.commons.rs.Resource;
import io.leitstand.ui.service.TagInfo;
import io.leitstand.ui.service.TagService;

@Resource
@Path("/system/tags")
public class TagResource {

	private TagService service;
	
	public TagResource() {
		// CDI & JAX-RS
	}
	
	@Inject
	public TagResource(TagService service) {
		this.service = service;
	}
	
	@GET
	public SortedSet<TagInfo> getTags(){
		return service.getTags();
	}
	
	@GET
	@Path("/{tag}")
	public TagInfo getTag(@PathParam("tag") String name) {
		return service.getTag(name);
	}
	
	@POST
	public void storeTags(Set<TagInfo> tags) {
		service.storeTags(tags);
	}
	
		
	@DELETE
	@Path("/{tag}")
	public void removeTag(@PathParam("tag") String name) {
		service.removeTag(name);
	}
	
}
