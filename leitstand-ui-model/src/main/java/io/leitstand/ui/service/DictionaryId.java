/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import java.util.UUID;

import javax.json.bind.annotation.JsonbTypeAdapter;

import io.leitstand.commons.model.Scalar;
import io.leitstand.ui.jsonb.DictionaryIdAdapter;

/**
 * Unique dictionary ID in UUIDv4 format.
 */
@JsonbTypeAdapter(DictionaryIdAdapter.class)
public class DictionaryId extends Scalar<String>{

	private static final long serialVersionUID = 1L;
	
	/**
	 * Creates a random dictionary ID.
	 * @return a random dictionary ID.
	 */
	public static DictionaryId randomDictionaryId() {
		return valueOf(UUID.randomUUID().toString());
	}

	/**
	 * Alias for {@link #valueOf(String)} to improve readability.
	 * <p>
	 * Creates a <code>DictionaryId</code>.
	 * @param id the dictionary ID
	 * @return the <code>DictionaryId</code> instance or <code>null</code> if the specified string is <code>null</code> or <em>empty</em>.
	 */
	public static DictionaryId dictionaryId(String id) {
		return valueOf(id);
	}

	
	/**
	 * Creates a <code>DictionaryId</code>.
	 * @param id the dictionary ID
	 * @return the <code>DictionaryId</code> instance or <code>null</code> if the specified string is <code>null</code> or <em>empty</em>.
	 */
	public static DictionaryId valueOf(String id) {
		return Scalar.fromString(id, DictionaryId::new);
	}
	
	private String value;
	
	/**
	 * Create a <code>DictionaryId</code>
	 * @param id the dictionary ID
	 */
	public DictionaryId(String id) {
		this.value = id;
	}
	
	/**
	 * Returns the dictionary name.
	 * @return the name.
	 */
	@Override
	public String getValue() {
		return value;
	}

}
