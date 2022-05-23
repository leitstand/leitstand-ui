/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.jsonb;

import javax.json.bind.adapter.JsonbAdapter;

import io.leitstand.ui.service.DictionaryId;

/**
 * Translates a string into a <code>DictionaryId</code> and vice versa.
 */
public class DictionaryIdAdapter implements JsonbAdapter<DictionaryId, String>{

	/**
	 * Translates a string into a <code>DictionaryId</code>.
	 * @param id the string value
	 * @return the <code>DictionaryId</code> or <code>null</code> if the string is <code>null</code> or empty.
	 */
	@Override
	public DictionaryId adaptFromJson(String id) throws Exception {
		return DictionaryId.valueOf(id);
	}

	/**
	 * Translates a <code>DictionaryId</code> into a string.
	 * @param id the dictionary ID
	 * @return the dictionary id or <code>null</code> if the specified ID is <code>null</code>.
	 */
	@Override
	public String adaptToJson(DictionaryId id) throws Exception {
		return DictionaryId.toString(id);
	}

}
