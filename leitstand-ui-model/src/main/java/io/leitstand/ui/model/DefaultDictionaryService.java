/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static io.leitstand.commons.messages.MessageFactory.createMessage;
import static io.leitstand.ui.model.Dictionary.findDictionariesByNamePattern;
import static io.leitstand.ui.model.Dictionary.findDictionaryById;
import static io.leitstand.ui.model.Dictionary.findDictionaryByName;
import static io.leitstand.ui.service.DictionaryInfo.newDictionaryInfo;
import static io.leitstand.ui.service.DictionarySettings.newDictionarySettings;
import static io.leitstand.ui.service.ReasonCode.LUI0001E_DICTIONARY_NOT_FOUND;
import static io.leitstand.ui.service.ReasonCode.LUI0002I_DICTIONARY_STORED;
import static io.leitstand.ui.service.ReasonCode.LUI0003I_DICTIONARY_REMOVED;
import static java.lang.String.format;
import static java.util.stream.Collectors.toList;

import java.util.List;
import java.util.logging.Logger;

import javax.inject.Inject;

import io.leitstand.commons.EntityNotFoundException;
import io.leitstand.commons.messages.Messages;
import io.leitstand.commons.model.Repository;
import io.leitstand.commons.model.Service;
import io.leitstand.model.Leitstand;
import io.leitstand.ui.service.DictionaryId;
import io.leitstand.ui.service.DictionaryInfo;
import io.leitstand.ui.service.DictionaryName;
import io.leitstand.ui.service.DictionaryService;
import io.leitstand.ui.service.DictionarySettings;

@Service
public class DefaultDictionaryService implements DictionaryService{
	
	private static final Logger LOG = Logger.getLogger(DefaultDictionaryService.class.getName());
	
	private Repository repository;
	
	private Messages messages;
	
	protected DefaultDictionaryService() {
		// CDI
	}
	
	@Inject
	protected DefaultDictionaryService(@Leitstand Repository repository,
									   Messages messages) {
		this.repository = repository;
		this.messages = messages;
	}
	
	@Override
	public List<DictionaryInfo> getDictionaries(String filter) {
		return repository.execute(findDictionariesByNamePattern(filter))
						 .stream()
						 .map( dict -> newDictionaryInfo()
									   .withDictionaryId(dict.getDictionaryId())
									   .withDictionaryName(dict.getDictionaryName())
								 	   .withDescription(dict.getDescription())
								 	   .build())
						 .collect(toList());
	
	}

	@Override
	public DictionarySettings getDictionary(DictionaryId id) {
		Dictionary dict = repository.execute(findDictionaryById(id));
		if(dict == null) {
			LOG.fine(() -> format("%s: Dictionary %s does not exist", 
								 LUI0001E_DICTIONARY_NOT_FOUND.getReasonCode(),
								 id));
			throw new EntityNotFoundException(LUI0001E_DICTIONARY_NOT_FOUND, 
											  id);
			
		}
		return settingsOf(dict);
	}

	@Override
	public DictionarySettings getDictionary(DictionaryName name) {
		Dictionary dict = repository.execute(findDictionaryByName(name));
		if(dict == null) {
			LOG.fine(() -> format("%s: Dictionary %s does not exist", 
								 LUI0001E_DICTIONARY_NOT_FOUND.getReasonCode(),
								 name));
			throw new EntityNotFoundException(LUI0001E_DICTIONARY_NOT_FOUND, 
											  name);
			
		}
		return settingsOf(dict);
	}
	
	private static DictionarySettings settingsOf(Dictionary dict) {
		return newDictionarySettings()
			   .withDictionaryId(dict.getDictionaryId())
			   .withDictionaryName(dict.getDictionaryName())
			   .withDescription(dict.getDescription())
			   .withEntries(dict.getEntries())
			   .build();
	}

	@Override
	public boolean storeDictionary(DictionarySettings settings) {
		boolean created = false;
		Dictionary dict = repository.execute(findDictionaryById(settings.getDictionaryId()));
		if(dict == null) {
			dict = new Dictionary(settings.getDictionaryId(), settings.getDictionaryName());
			repository.add(dict);
			created = true;
		}
		dict.setDictionaryName(settings.getDictionaryName());
		dict.setDescription(settings.getDescription());
		dict.setEntries(settings.getEntries());
		messages.add(createMessage(LUI0002I_DICTIONARY_STORED, 
								   settings.getDictionaryId(), 
								   settings.getDictionaryName()));
		LOG.fine(() -> format("%s: Dictionary %s (%s) stored", 
				  			  LUI0002I_DICTIONARY_STORED.getReasonCode(),
				  			  settings.getDictionaryName(),
				  			  settings.getDictionaryId()));
		return created;
	}

	@Override
	public void removeDictionary(DictionaryId id) {
		Dictionary dict = repository.execute(findDictionaryById(id));
		if(dict != null) {
			LOG.fine(() -> format("%s: Dictionary %s (%s) removed", 
								 LUI0003I_DICTIONARY_REMOVED.getReasonCode(),
								 dict.getDictionaryName(),
								 dict.getDictionaryId()));
			messages.add(createMessage(LUI0003I_DICTIONARY_REMOVED,
									   dict.getDictionaryId(), 
									   dict.getDictionaryName()));
			repository.remove(dict);
		}
	}

	@Override
	public void removeDictionary(DictionaryName name) {
		Dictionary dict = repository.execute(findDictionaryByName(name));
		if(dict != null) {
			LOG.fine(() -> format("%s: Dictionary %s (%s) removed", 
								 LUI0003I_DICTIONARY_REMOVED.getReasonCode(),
								 dict.getDictionaryName(),
								 dict.getDictionaryId()));
			messages.add(createMessage(LUI0003I_DICTIONARY_REMOVED,
									   dict.getDictionaryId(), 
									   dict.getDictionaryName()));
			repository.remove(dict);
		}		
	}

}
