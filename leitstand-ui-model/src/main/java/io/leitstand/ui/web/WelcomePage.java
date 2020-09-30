package io.leitstand.ui.web;

import static javax.servlet.http.HttpServletResponse.SC_NOT_FOUND;

import java.io.IOException;

import javax.inject.Inject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.leitstand.ui.model.MainMenuItem;
import io.leitstand.ui.model.MainMenuService;

@WebServlet(name="WelcomePage", urlPatterns="/ui/welcome")
public class WelcomePage extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Inject
    private MainMenuService service;
    
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
                      throws IOException{
    
        MainMenuItem welcome = service.getMainMenu().findWelcomePageModule();
        if(welcome == null) {
            response.sendError(SC_NOT_FOUND);
            return;
        }
        response.sendRedirect("/ui/views"+welcome.getPath());

    }
    
    
}
