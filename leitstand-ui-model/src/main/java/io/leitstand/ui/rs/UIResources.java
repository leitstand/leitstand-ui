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
package io.leitstand.ui.rs;

import static io.leitstand.commons.model.ObjectUtil.asSet;

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
		return asSet(MainMenuResource.class,
                             DictionaryResource.class,
                             ModuleDescriptorResource.class,
                             LogoutResource.class,
                             JsonMessageBodyWriter.class);
	}

}
