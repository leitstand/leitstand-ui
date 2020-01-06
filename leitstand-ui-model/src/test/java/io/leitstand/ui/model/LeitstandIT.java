/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static java.lang.ClassLoader.getSystemResourceAsStream;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

import javax.sql.DataSource;

import io.leitstand.testing.it.JpaIT;

public class LeitstandIT extends JpaIT {

	/** {@inheritDoc} */
	@Override
	protected Properties getConnectionProperties() throws IOException {
		Properties properties = new Properties();
		properties.load(getSystemResourceAsStream("UI-it.properties"));
		return properties;
	}
	
	/** {@inheritDoc} */
	@Override
	protected void initDatabase(DataSource ds) throws SQLException{
		try (Connection c = ds.getConnection()) {
			// Create empty schemas to enable JPA to create all tables. 
			c.createStatement().execute("CREATE SCHEMA leitstand;");
		} 
	}
	
	/** {@inheritDoc} */
	@Override
	protected String getPersistenceUnitName() {
		// Inventory module resource name.
		return "leitstand";
	}

}
