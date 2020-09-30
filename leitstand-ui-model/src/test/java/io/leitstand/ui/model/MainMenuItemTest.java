package io.leitstand.ui.model;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.mockito.InOrder;


public class MainMenuItemTest {

    @Test
    public void return_null_welcome_item_if_menu_is_empty() {
        MainMenu menu = new MainMenu();
        assertNull(menu.findWelcomePageModule());
    }
    
    @Test
    public void use_first_menu_item_as_default_welcome_page() {
        MainMenuItem a = mock(MainMenuItem.class);
        MainMenuItem b = mock(MainMenuItem.class);
        MainMenuItem c = mock(MainMenuItem.class);
        
        MainMenu menu = new MainMenu(asList(a,b,c));
        assertSame(a,menu.findWelcomePageModule());
        
        InOrder order = inOrder(a,b,c);
        order.verify(a).isWelcomeModule();
        order.verify(b).isWelcomeModule();
        order.verify(c).isWelcomeModule();
        
    }
    
    @Test
    public void use_specified_welcome_page() {
        MainMenuItem a = mock(MainMenuItem.class);
        MainMenuItem b = mock(MainMenuItem.class);
        MainMenuItem c = mock(MainMenuItem.class);

        when(b.isWelcomeModule()).thenReturn(true);
        
        MainMenu menu = new MainMenu(asList(a,b,c));
        assertSame(b,menu.findWelcomePageModule());
        
        InOrder order = inOrder(a,b,c);
        order.verify(a).isWelcomeModule();
        order.verify(b).isWelcomeModule();

        verifyZeroInteractions(c);
    }
    
}
