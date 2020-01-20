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

import static java.lang.String.format;
import static javax.ws.rs.core.Response.temporaryRedirect;

import java.net.URI;
import java.util.logging.Logger;

import javax.enterprise.context.RequestScoped;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

@RequestScoped
@Path("/_logout")
public class LogoutResource {
	
	private static final Logger LOG = Logger.getLogger(LogoutResource.class.getName());

	@GET
	public Response browserLogout(@Context HttpServletRequest request) {
		try {
			request.logout();
		} catch (ServletException e) {
			LOG.fine(() -> format("An error occured while attempting to logoff user %s: %s", 
								  request.getUserPrincipal(), 
								  e.getMessage()));
		}
		return temporaryRedirect(URI.create("/ui/login/login.html")).build();
	}
	

	
}
