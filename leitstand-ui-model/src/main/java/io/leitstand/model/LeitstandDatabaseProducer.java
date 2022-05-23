package io.leitstand.model;

import javax.annotation.Resource;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.Dependent;
import javax.enterprise.inject.Produces;
import javax.sql.DataSource;

import io.leitstand.commons.db.DatabaseService;

@Dependent
public class LeitstandDatabaseProducer {

	
    @Resource(lookup="java:/jdbc/leitstand")
    private DataSource ds;
    
    @Produces
    @ApplicationScoped
    @Leitstand
    public DatabaseService createInventoryDatabaseService() {
        return new DatabaseService(ds);
    }
	
}
