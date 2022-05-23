/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.rs;

import static io.leitstand.commons.rs.ReasonCode.VAL0003E_IMMUTABLE_ATTRIBUTE;
import static io.leitstand.testing.ut.LeitstandCoreMatchers.reason;
import static io.leitstand.ui.service.DictionaryId.randomDictionaryId;
import static io.leitstand.ui.service.DictionarySettings.newDictionarySettings;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import javax.ws.rs.core.Response;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import io.leitstand.commons.UnprocessableEntityException;
import io.leitstand.commons.messages.Messages;
import io.leitstand.ui.service.DictionaryId;
import io.leitstand.ui.service.DictionaryName;
import io.leitstand.ui.service.DictionaryService;
import io.leitstand.ui.service.DictionarySettings;

@RunWith(MockitoJUnitRunner.class)
public class DictionaryResourceTest {
	
	private static final DictionaryId DICTIONARY_ID = randomDictionaryId();
	private static final DictionaryName DICTIONARY_NAME = DictionaryName.valueOf("dictionary");
	
	@Rule
	public ExpectedException exception = ExpectedException.none();

	@Mock
	private DictionaryService service;
	
	@Mock
	private Messages messages;
	
	@InjectMocks
	private DictionaryResource resource = new DictionaryResource();
	
	

	@Test
	public void send_created_response_when_posting_new_dictionary() {
		DictionarySettings dict = newDictionarySettings()
								  .withDictionaryId(DICTIONARY_ID)
								  .withDictionaryName(DICTIONARY_NAME)
								  .build();
		when(service.storeDictionary(dict)).thenReturn(true);
		
		Response response = resource.storeDictionary(dict);
		
		assertEquals(201,response.getStatus());
	}
	
	@Test
	public void send_success_response_when_posting_existing_dictionary() {
		DictionarySettings dict = newDictionarySettings()
								  .withDictionaryId(DICTIONARY_ID)
								  .withDictionaryName(DICTIONARY_NAME)
								  .build();
		when(service.storeDictionary(dict)).thenReturn(false);

		Response response = resource.storeDictionary(dict);

		assertEquals(200,response.getStatus());
	}
	
	@Test
	public void send_created_response_when_putting_new_dictionary() {
		DictionarySettings dict = newDictionarySettings()
				  				  .withDictionaryId(DICTIONARY_ID)
				  				  .withDictionaryName(DICTIONARY_NAME)
				  				  .build();
		when(service.storeDictionary(dict)).thenReturn(true);
		
		Response response = resource.storeDictionary(DICTIONARY_ID, dict);
		
		assertEquals(201,response.getStatus());
	}
	
	@Test
	public void send_success_response_when_putting_existing_dictionary() {
		DictionarySettings dict = newDictionarySettings()
								  .withDictionaryId(DICTIONARY_ID)
								  .withDictionaryName(DICTIONARY_NAME)
								  .build();
		when(service.storeDictionary(dict)).thenReturn(false);
		
		Response response = resource.storeDictionary(DICTIONARY_ID, dict);
		
		assertEquals(200,response.getStatus());
	}
	
	@Test
	public void report_conflict_when_attempting_to_modify_dictionary_id() {
		exception.expect(UnprocessableEntityException.class);
		exception.expect(reason(VAL0003E_IMMUTABLE_ATTRIBUTE));
		
		DictionarySettings dict = newDictionarySettings()
								  .withDictionaryId(randomDictionaryId())
								  .withDictionaryName(DICTIONARY_NAME)
								  .build();
		when(service.storeDictionary(dict)).thenReturn(true);
		resource.storeDictionary(DICTIONARY_ID, dict);
		
	}
	
	
}
