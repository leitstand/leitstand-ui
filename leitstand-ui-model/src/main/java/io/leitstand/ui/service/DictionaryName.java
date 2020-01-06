/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import javax.json.bind.annotation.JsonbTypeAdapter;

import io.leitstand.commons.model.Scalar;
import io.leitstand.ui.jsonb.DictionaryNameAdapter;

/**
 * Unique dictionary name.
 */
@JsonbTypeAdapter(DictionaryNameAdapter.class)
public class DictionaryName extends Scalar<String>{

	private static final long serialVersionUID = 1L;

	/**
	 * Alias for <code>DictionaryName</code> to improve readability.
	 * <p>
	 * Create a <code>DictionaryName</code>.
	 * @param name the dictionary name
	 * @return the <code>DictionaryName</code> instance or <code>null</code> if the specified string is <code>null</code> or <em>empty</em>.
	 */
	public static DictionaryName dictionaryName(String name) {
		return valueOf(name);
	}
	
	/**
	 * Create a <code>DictionaryName</code>.
	 * @param name the dictionary name
	 * @return the <code>DictionaryName</code> instance or <code>null</code> if the specified string is <code>null</code> or <em>empty</em>.
	 */
	public static DictionaryName valueOf(String name) {
		return Scalar.fromString(name, DictionaryName::new);
	}
	
	private String value;
	
	/**
	 * Creates a <code>DictionaryName</code>.
	 * @param name the dictionary name
	 */
	public DictionaryName(String name) {
		this.value = name;
	}
	
	/**
	 * Returns the dictionary name.
	 * @return the dictionary name.
	 */
	@Override
	public String getValue() {
		return value;
	}
	
}
