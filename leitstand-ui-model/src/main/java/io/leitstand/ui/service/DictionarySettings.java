/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;
import static java.util.Arrays.stream;
import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableSortedSet;
import static java.util.stream.Collectors.toList;

import java.util.ArrayList;
import java.util.Collections;
import java.util.SortedSet;
import java.util.TreeSet;

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
			return withEntries(new TreeSet<>(stream(entries)
							   .map(DictionaryEntry.Builder::build)
							   .collect(toList())));
		}
		
		/**
		 * Sets the dictionary entries
		 * @param entries the dictionary entries
		 * @return a reference to this builder to continue with the object creation
		 */
		public Builder withEntries(SortedSet<DictionaryEntry> entries) {
			assertNotInvalidated(getClass(), dictionary);
			((DictionarySettings)dictionary).entries = new TreeSet<>(entries);
			return this;
		}
		
	}
	
	private SortedSet<DictionaryEntry> entries;
	
	/**
	 * Returns the entries of this dictionary as immutable list.
	 * @return the dictionary entries.
	 */
	public SortedSet<DictionaryEntry> getEntries() {
		return unmodifiableSortedSet(entries);
	}
	
	
}
