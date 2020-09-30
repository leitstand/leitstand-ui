package io.leitstand.ui.web;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import io.leitstand.ui.model.MainMenu;
import io.leitstand.ui.model.MainMenuItem;
import io.leitstand.ui.model.MainMenuService;

@RunWith(MockitoJUnitRunner.class)
public class WelcomePageTest {

    @Mock
    private MainMenuService service;
    
    @Mock
    private HttpServletRequest request;
    
    @Mock
    private HttpServletResponse response;
    
    @InjectMocks
    private WelcomePage page = new WelcomePage();
    
    
    @Test
    public void return_welcome_page_not_found_for_empty_main_menu() throws IOException {
        MainMenu mainMenu = mock(MainMenu.class);
        when(service.getMainMenu()).thenReturn(mainMenu);

        page.doGet(request, response);
        
        verify(response).sendError(HttpServletResponse.SC_NOT_FOUND);
        verifyZeroInteractions(request);
        
    }
    

    @Test
    public void return_redirect_to_welcome_menu() throws IOException {
        MainMenuItem welcome = mock(MainMenuItem.class);
        when(welcome.getPath()).thenReturn("/welcome/to/leitstand.html");
        MainMenu mainMenu = mock(MainMenu.class);
        when(mainMenu.findWelcomePageModule()).thenReturn(welcome);
        when(service.getMainMenu()).thenReturn(mainMenu);
        
        page.doGet(request, response);
        
        verify(response).sendRedirect("/ui/views/welcome/to/leitstand.html");
        verifyZeroInteractions(request);
  }

    
    
}
