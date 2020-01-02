/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
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
