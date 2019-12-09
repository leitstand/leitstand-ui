/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui;

import static java.util.logging.Level.FINE;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
@WebServlet(name="Leitstand", 
			urlPatterns={"/ui/*"}, //*.html
			loadOnStartup=1)
public class LeitstandServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	private static final Logger LOG = Logger.getLogger(LeitstandServlet.class.getName());
	
	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{
		try {
			getServletContext().getRequestDispatcher("/leitstand.html").forward(request, response);
		} catch( ServletException | IOException e) {
			LOG.log(FINE,e.getMessage(),e);
		}
	}
	
}