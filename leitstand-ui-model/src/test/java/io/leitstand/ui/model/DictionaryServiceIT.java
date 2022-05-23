/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static io.leitstand.commons.db.DatabaseService.prepare;
import static io.leitstand.testing.ut.LeitstandCoreMatchers.contains;
import static io.leitstand.testing.ut.LeitstandCoreMatchers.isEmptyList;
import static io.leitstand.ui.service.DictionaryEntry.newDictionaryEntry;
import static io.leitstand.ui.service.DictionaryId.randomDictionaryId;
import static io.leitstand.ui.service.DictionaryName.dictionaryName;
import static io.leitstand.ui.service.DictionarySettings.newDictionarySettings;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import io.leitstand.commons.messages.Messages;
import io.leitstand.commons.model.Repository;
import io.leitstand.ui.service.DictionaryId;
import io.leitstand.ui.service.DictionaryInfo;
import io.leitstand.ui.service.DictionaryService;
import io.leitstand.ui.service.DictionarySettings;

public class DictionaryServiceIT extends LeitstandIT{
	
	

	private DictionaryService service;
	
	@Before
	public void initTestEnvironment() {
		Repository repository = new Repository(getEntityManager());
		service = new DefaultDictionaryService(repository, mock(Messages.class));
	}

	@After
	public void clearTestEnvironment() {
		transaction(()->{
			getDatabase().executeUpdate(prepare("DELETE FROM leitstand.dictionary_entry"));
			getDatabase().executeUpdate(prepare("DELETE FROM leitstand.dictionary"));
		});
	}
	
	@Test
	public void add_dictionary() {
		DictionarySettings dict = newDictionarySettings()
								  .withDictionaryId(randomDictionaryId())
								  .withDictionaryName(dictionaryName("dictionary"))
								  .withDescription("description")
								  .withEntries(newDictionaryEntry()
										  	   .withLabel("Option A")
										  	   .withValue("a"),
										  	   newDictionaryEntry()
										  	   .withLabel("Option B")
										  	   .withValue("b"))
								  .build();
		
		transaction(() -> {
			boolean created = service.storeDictionary(dict);
			assertTrue(created);
		});
		
		transaction(() -> {
			DictionarySettings reloaded = service.getDictionary(dict.getDictionaryId());
			assertEquals(dict,reloaded);
		});
		
	}
	
	@Test
	public void update_dictionary() {
		DictionaryId dictId = randomDictionaryId();
		
		transaction(() -> {
			DictionarySettings dict = newDictionarySettings()
									  .withDictionaryId(dictId)
									  .withDictionaryName(dictionaryName("dictionary"))
									  .withDescription("description")
									  .withEntries(newDictionaryEntry()
											  	   .withLabel("Option A")
											  	   .withValue("a"),
											  	   newDictionaryEntry()
											  	   .withLabel("Option B")
											  	   .withValue("b"))
									  .build();
			boolean created = service.storeDictionary(dict);
			assertTrue(created);
		});
		
		DictionarySettings dict = newDictionarySettings()
								  .withDictionaryId(dictId)
								  .withDictionaryName(dictionaryName("renamed"))
								  .withDescription("new description")
								  .withEntries(newDictionaryEntry()
										  	   .withLabel("Option B")
										  	   .withValue("b")
										  	   .withDefaultValue(true),
										  	   newDictionaryEntry()
										  	   .withLabel("Option C")
										  	   .withValue("c"))
								  .build();
		
		transaction(() -> {
			boolean created = service.storeDictionary(dict);
			assertFalse(created);
		});
		
		transaction(() -> {
			DictionarySettings reloaded = service.getDictionary(dict.getDictionaryName());
			assertEquals(dict,reloaded);
		});
	}
	
	@Test
	public void remove_dictionary_by_id() {
		DictionarySettings dict = newDictionarySettings()
								  .withDictionaryId(randomDictionaryId())
								  .withDictionaryName(dictionaryName("dictionary"))
								  .withDescription("description")
								  .withEntries(newDictionaryEntry()
										  	   .withLabel("Option A")
										  	   .withValue("a"),
										  	   newDictionaryEntry()
										  	   .withLabel("Option B")
										  	   .withValue("b"))
								  .build();	

		transaction(() -> {
			boolean created = service.storeDictionary(dict);
			assertTrue(created);
		});
		
		transaction(() -> {
			List<DictionaryInfo> dicts = service.getDictionaries("dictionary");
			assertThat(dicts,contains(info -> info.getDictionaryId().equals(dict.getDictionaryId())));
			service.removeDictionary(dict.getDictionaryId());
		});

		transaction(() -> {
			List<DictionaryInfo> dicts = service.getDictionaries("dictionary");
			assertThat(dicts,isEmptyList()); ;
		});
		
	}
	
	@Test
	public void remove_dictionary_by_name() {
		DictionarySettings dict = newDictionarySettings()
				  				  .withDictionaryId(randomDictionaryId())
				  				  .withDictionaryName(dictionaryName("dictionary"))
				  				  .withDescription("description")
				  				  .withEntries(newDictionaryEntry()
				  						  	   .withLabel("Option A")
				  						  	   .withValue("a"),
				  						  	   newDictionaryEntry()
				  						  	   .withLabel("Option B")
				  						  	   .withValue("b"))
				  				  .build();	

		transaction(() -> {
			boolean created = service.storeDictionary(dict);
			assertTrue(created);
		});

		transaction(() -> {
			List<DictionaryInfo> dicts = service.getDictionaries("dictionary");
			assertThat(dicts,contains(info -> info.getDictionaryId().equals(dict.getDictionaryId())));
			service.removeDictionary(dict.getDictionaryName());
		});

		transaction(() -> {
			List<DictionaryInfo> dicts = service.getDictionaries("dictionary");
			assertThat(dicts,isEmptyList()); ;
		});
	}
	
}
