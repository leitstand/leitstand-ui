/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static io.leitstand.ui.service.DictionaryEntry.newDictionaryEntry;
import static io.leitstand.ui.service.DictionaryId.randomDictionaryId;
import static io.leitstand.ui.service.DictionaryName.dictionaryName;
import static io.leitstand.ui.service.DictionarySettings.newDictionarySettings;
import static io.leitstand.ui.service.ReasonCode.LUI0001E_DICTIONARY_NOT_FOUND;
import static io.leitstand.ui.service.ReasonCode.LUI0002I_DICTIONARY_STORED;
import static io.leitstand.ui.service.ReasonCode.LUI0003I_DICTIONARY_REMOVED;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import io.leitstand.commons.EntityNotFoundException;
import io.leitstand.commons.messages.Message;
import io.leitstand.commons.messages.Messages;
import io.leitstand.commons.model.Query;
import io.leitstand.commons.model.Repository;
import io.leitstand.testing.ut.LeitstandCoreMatchers;
import io.leitstand.ui.service.DictionaryService;
import io.leitstand.ui.service.DictionarySettings;

@RunWith(MockitoJUnitRunner.class)
public class DefaultDictionaryServiceTest {

	@Rule
	public ExpectedException exception = ExpectedException.none();
	
	@Mock
	private Repository repository;
	
	@Mock
	private Messages messages;
	
	@InjectMocks
	private  DictionaryService service = new DefaultDictionaryService();

	@Test
	public void throw_EntityNotFoundException_for_unknown_dictionary_id() {
		exception.expect(EntityNotFoundException.class);
		exception.expect(LeitstandCoreMatchers.reason(LUI0001E_DICTIONARY_NOT_FOUND));
		
		service.getDictionary(randomDictionaryId());
	}
	
	@Test
	public void throw_EntityNotFoundException_for_unknown_dictionary_name() {
		exception.expect(EntityNotFoundException.class);
		exception.expect(LeitstandCoreMatchers.reason(LUI0001E_DICTIONARY_NOT_FOUND));
		
		service.getDictionary(dictionaryName("unknown"));
	}
	
	@Test
	public void do_nothing_when_attempting_to_remove_unknown_dictionary_id() {
		service.removeDictionary(randomDictionaryId());

		verify(repository,never()).remove(any(Query.class));
		verifyZeroInteractions(messages);
	}
	
	@Test
	public void do_nothing_when_attempting_to_remove_unknown_dictionary_name() {
		service.removeDictionary(randomDictionaryId());

		verify(repository,never()).remove(any(Query.class));
		verifyZeroInteractions(messages);
	}
	
	@Test
	public void remove_existing_dictionary_identified_by_id() {
		Dictionary dict = new Dictionary(randomDictionaryId(), dictionaryName("dict"));
		when(repository.execute(any(Query.class))).thenReturn(dict);
		ArgumentCaptor<Message> sentMessage = ArgumentCaptor.forClass(Message.class);
		doNothing().when(messages).add(sentMessage.capture());
		
		service.removeDictionary(dict.getDictionaryId());
		
		verify(repository).remove(dict);
		assertEquals(LUI0003I_DICTIONARY_REMOVED.getReasonCode(), sentMessage.getValue().getReason());
	}
	
	@Test
	public void remove_existing_dictionary_identified_by_name() {
		Dictionary dict = new Dictionary(randomDictionaryId(), dictionaryName("dict"));
		when(repository.execute(any(Query.class))).thenReturn(dict);
		ArgumentCaptor<Message> sentMessage = ArgumentCaptor.forClass(Message.class);
		doNothing().when(messages).add(sentMessage.capture());
		
		service.removeDictionary(dict.getDictionaryName());
		
		verify(repository).remove(dict);
		assertEquals(LUI0003I_DICTIONARY_REMOVED.getReasonCode(), sentMessage.getValue().getReason());
	}
	
	@Test
	public void create_new_dictionary_if_needed() {
		
		DictionarySettings settings = newDictionarySettings()
								  	  .withDictionaryId(randomDictionaryId())
								  	  .withDictionaryName(dictionaryName("dictionary"))
								  	  .withDescription("description")
								  	  .withEntries(newDictionaryEntry()
								  			  	   .withLabel("Option A")
								  			  	   .withValue("a")
								  			  	   .withDefaultValue(false),
								  			  	   newDictionaryEntry()
								  			  	   .withLabel("Option B")
								  			  	   .withValue("b"))
								  	  .build();
		
		ArgumentCaptor<Dictionary> createdDict = ArgumentCaptor.forClass(Dictionary.class);
		doNothing().when(repository).add(createdDict.capture());
		ArgumentCaptor<Message> sentMessage = ArgumentCaptor.forClass(Message.class);
		doNothing().when(messages).add(sentMessage.capture());
		
		service.storeDictionary(settings);
		
		assertEquals(settings.getDictionaryId(),createdDict.getValue().getDictionaryId());
		assertEquals(settings.getDictionaryName(),createdDict.getValue().getDictionaryName());
		assertEquals(settings.getDescription(),createdDict.getValue().getDescription());
		assertEquals(settings.getEntries(),createdDict.getValue().getEntries());
		assertEquals(LUI0002I_DICTIONARY_STORED.getReasonCode(),sentMessage.getValue().getReason());
	}

	
	@Test
	public void update_existing_dictionary() {
		
		DictionarySettings settings = newDictionarySettings()
								  	  .withDictionaryId(randomDictionaryId())
								  	  .withDictionaryName(dictionaryName("dictionary"))
								  	  .withDescription("description")
								  	  .withEntries(newDictionaryEntry()
								  			  	   .withLabel("Option A")
								  			  	   .withValue("a")
								  			  	   .withDefaultValue(false),
								  			  	   newDictionaryEntry()
								  			  	   .withLabel("Option B")
								  			  	   .withValue("b"))
								  	  .build();

		Dictionary dict = mock(Dictionary.class);
		when(repository.execute(any(Query.class))).thenReturn(dict);
		
		ArgumentCaptor<Message> sentMessage = ArgumentCaptor.forClass(Message.class);
		doNothing().when(messages).add(sentMessage.capture());
		
		service.storeDictionary(settings);
		
		verify(dict).setDictionaryName(settings.getDictionaryName());
		verify(dict).setDescription(settings.getDescription());
		verify(dict).setEntries(settings.getEntries());
		assertEquals(LUI0002I_DICTIONARY_STORED.getReasonCode(),sentMessage.getValue().getReason());
	}
	
	
}
