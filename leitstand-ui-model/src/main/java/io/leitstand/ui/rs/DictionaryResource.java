/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.rs;

import static io.leitstand.commons.model.ObjectUtil.isDifferent;
import static io.leitstand.commons.model.Patterns.UUID_PATTERN;
import static io.leitstand.commons.rs.ReasonCode.VAL0003E_IMMUTABLE_ATTRIBUTE;
import static io.leitstand.commons.rs.Responses.created;
import static io.leitstand.commons.rs.Responses.success;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import io.leitstand.commons.UnprocessableEntityException;
import io.leitstand.commons.messages.Messages;
import io.leitstand.ui.service.DictionaryId;
import io.leitstand.ui.service.DictionaryInfo;
import io.leitstand.ui.service.DictionaryName;
import io.leitstand.ui.service.DictionaryService;
import io.leitstand.ui.service.DictionarySettings;

@RequestScoped
@Path("/api/v1/directorys")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
public class DictionaryResource {

	@Inject
	private DictionaryService service;
	
	@Inject
	private Messages messages;
	
	
	@GET
	public List<DictionaryInfo> getDictionaries(@QueryParam("filter") String filter){
		return service.getDictionaries(filter);
	}
	
	@GET
	@Path("/{dictionary:"+UUID_PATTERN+"}")
	public DictionarySettings getDictionary(@PathParam("dictionary") DictionaryId id) {
		return service.getDictionary(id);
	}
	
	@GET
	@Path("/{dictionary}")
	public DictionarySettings getDictionary(@PathParam("dictionary") DictionaryName name) {
		return service.getDictionary(name);
	}

	@DELETE
	@Path("/{dictionary:"+UUID_PATTERN+"}")
	public void removeDictionary(@PathParam("dictionary") DictionaryId id) {
		service.removeDictionary(id);
	}
	
	@DELETE
	@Path("/{dictionary}")
	public void removeDictionary(@PathParam("dictionary") DictionaryName name) {
		service.removeDictionary(name);
	}
	
	@PUT
	@Path("/{dictionary:"+UUID_PATTERN+"}")
	public Response storeDictionary(DictionaryId id, DictionarySettings settings) {
		if(isDifferent(id, settings.getDictionaryId())) {
			throw new UnprocessableEntityException(VAL0003E_IMMUTABLE_ATTRIBUTE, 
												   id,
												   settings.getDictionaryId());
		}
		boolean created = service.storeDictionary(settings);
		if(created) {
			return created(messages, settings.getDictionaryId());
		}
		return success(messages);
		
	}
	
	@POST
	public Response storeDictionary(DictionarySettings settings) {
		boolean created = service.storeDictionary(settings);
		if(created) {
			return created(messages, settings.getDictionaryId());
		}
		return success(messages);
	}
	
}
