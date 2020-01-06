/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.model;

import javax.enterprise.inject.Disposes;
import javax.enterprise.inject.Produces;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import javax.transaction.TransactionScoped;

import io.leitstand.commons.model.Repository;

/**
 * Produces transaction-scoped repositories for the leitstand module.
 */
public class LeitstandRepositoryProducer {

	@PersistenceUnit(unitName="inventory")
	private EntityManagerFactory emf;
	
	/**
	 * Obtains a transaction-scoped entity manager to create an inventory repository.
	 * @return a transaction-scoped inventory repository.
	 */
	@Produces
	@TransactionScoped
	@Leitstand
	public Repository createInventoryRepository() {
		return new Repository(emf.createEntityManager());
	}
	
	/**
	 * Closes a repository and the underlying transaction-scoped entity manager.
	 * @param repository the repository to be closed
	 */
	public void closeRepository(@Disposes @Leitstand Repository repository) {
		repository.close();
	}	
}
