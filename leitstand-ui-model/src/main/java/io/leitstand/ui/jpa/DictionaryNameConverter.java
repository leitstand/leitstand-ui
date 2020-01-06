/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.jpa;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import io.leitstand.ui.service.DictionaryName;

/**
 * Converts a string into a <code>DictionaryName</code> or vice versa.
 */
@Converter(autoApply=true)
public class DictionaryNameConverter implements AttributeConverter<DictionaryName,String>{

	/**
	 * Converts a <code>DictionaryName</code> to a string.
	 * @param name the dictionary name
	 * @return the dictionary name or <code>null</code> if the specified name is <code>null</code>
	 */
	@Override
	public String convertToDatabaseColumn(DictionaryName name) {
		return DictionaryName.toString(name);
	}

	/**
	 * Convertes a string into a <code>DictionaryName</code>
	 * @param name the dictionary name
	 * @return the <code>DictionaryName</code> or <code>null</code> if the specified string is <code>null</code> or empty.
	 */
	@Override
	public DictionaryName convertToEntityAttribute(String name) {
		return DictionaryName.valueOf(name);
	}
}