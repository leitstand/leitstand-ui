/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.jsonb;

import javax.json.bind.adapter.JsonbAdapter;

import io.leitstand.ui.service.DictionaryName;

/**
 * Translates a string into a <code>DictionaryName</code> and vice versa.
 */
public class DictionaryNameAdapter implements JsonbAdapter<DictionaryName, String>{

	/**
	 * Translates a string into a <code>DictionaryName</code>.
	 * @param name the string value
	 * @return the <code>DictionaryName</code> or <code>null</code> if the string is <code>null</code> or empty.
	 */
	@Override
	public DictionaryName adaptFromJson(String name) throws Exception {
		return DictionaryName.valueOf(name);
	}

	/**
	 * Translates a <code>DictionaryName</code> into a string.
	 * @param name the dictionary name
	 * @return the dictionary name or <code>null</code> if the specified name is <code>null</code>.
	 */
	@Override
	public String adaptToJson(DictionaryName name) throws Exception {
		return DictionaryName.toString(name);
	}

}
