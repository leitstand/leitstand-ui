/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import java.util.List;

/**
 * The <code>DictionaryService</code> is used to access and manage dictionaries.
 * <p>
 * A dictionary is a list of values with associated label and optionally a declared default value, 
 * and is typically displayed as select box in the Leitstand user interface.
 * </p>
 */
public interface DictionaryService {

	
	/**
	 * Returns a list of dictionaries that matches the given filter expression.
	 * @param filter regular expression to filter dictionaries by their name
	 * @return an immutable list of dictionaries or an empty list if no matching dictionaries exists.
	 */
	List<DictionaryInfo> getDictionaries(String filter);
	
	/**
	 * Returns the dictionary with the specified ID.
	 * @param id the dictionary id
	 * @return the dictionary with the specified ID.
	 */
	DictionarySettings getDictionary(DictionaryId id);

	/**
	 * Returns the dictionary with the specified name.
	 * @param id the dictionary name
	 * @return the dictionary with the specified name.
	 */
	DictionarySettings getDictionary(DictionaryName name);
	
	/**
	 * Stores the specified dictionary.
	 * <p>
	 * Creates a new dictionary or updates an existing dictionary.
	 * @param settings the dictionary settings
	 * @return <code>true</code> if a new dictionary was created, otherwise <code>false</code>.
	 */
	boolean storeDictionary(DictionarySettings settings);
	
	/**
	 * Removes the dictionary with the specified ID.
	 * Fails silently if the dictionary does not exist.
	 * @param id the dictionary ID
	 */
	void removeDictionary(DictionaryId id);
	
	/**
	 * Removes the dictionary with the specified name.
	 * Fails silently if the dictionary does not exist.
	 * @param name the dictionary name
	 */
	void removeDictionary(DictionaryName name);
	
}
