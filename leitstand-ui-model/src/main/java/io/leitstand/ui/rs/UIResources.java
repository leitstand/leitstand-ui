/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.rs;

import static java.util.Arrays.asList;

import java.util.HashSet;
import java.util.Set;

import javax.enterprise.context.Dependent;

import io.leitstand.commons.jsonb.JsonMessageBodyWriter;
import io.leitstand.commons.rs.ApiResourceProvider;


/**
 * Enumerates all UI resources required to build the EMS single page application.
 * 
 * @see MainMenuResource
 * @see ModuleDescriptorResource
 */
@Dependent
public class UIResources implements ApiResourceProvider{

	/**
	 * Returns all resources providing UI meta data.
	 */
	@Override
	public Set<Class<?>> getResources(){
		return new HashSet<>(asList(MainMenuResource.class, 
									ModuleDescriptorResource.class,
									LogoutResource.class,
									JsonMessageBodyWriter.class));
	}

}