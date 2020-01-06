/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;
import static java.util.Arrays.stream;
import static java.util.Collections.unmodifiableList;
import static java.util.stream.Collectors.toList;

import java.util.ArrayList;
import java.util.List;

/**
 * Dictionary settings.
 * <p>
 * A dictionary is a list of values with associated label and optionally a declared default value, 
 * and is typically displayed as select box in the Leitstand user interface.
 */
public class DictionarySettings extends DictionaryInfo {

	/**
	 * Returns a builder to create an immutable <code>DictionarySettings</code> value object.
	 * @return a builder to create a <code>DictionarySettings</code> value object.
	 */
	public static Builder newDictionarySettings() {
		return new Builder();
	}
	
	public static class Builder extends BaseDictionaryBuilder<DictionarySettings, Builder> {

		protected Builder() {
			super(new DictionarySettings());
		}
		
		/**
		 * Sets the dictionary entries
		 * @param entries the dictionary entries
		 * @return a reference to this builder to continue with the object creation
		 */
		public Builder withEntries(DictionaryEntry.Builder... entries) {
			return withEntries(stream(entries)
							   .map(DictionaryEntry.Builder::build)
							   .collect(toList()));
		}
		
		/**
		 * Sets the dictionary entries
		 * @param entries the dictionary entries
		 * @return a reference to this builder to continue with the object creation
		 */
		public Builder withEntries(List<DictionaryEntry> entries) {
			assertNotInvalidated(getClass(), dictionary);
			((DictionarySettings)dictionary).entries = new ArrayList<>(entries);
			return this;
		}
		
	}
	
	private List<DictionaryEntry> entries;
	
	/**
	 * Returns the entries of this dictionary as immutable list.
	 * @return the dictionary entries.
	 */
	public List<DictionaryEntry> getEntries() {
		return unmodifiableList(entries);
	}
	
	
}
