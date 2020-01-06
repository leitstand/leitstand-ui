/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;
import static io.leitstand.ui.service.DictionaryId.randomDictionaryId;

import io.leitstand.commons.model.ValueObject;

/**
 * Dictionary settings.
 * <p>
 * A dictionary is a list of values with associated label and optionally a declared default value, 
 * and is typically displayed as select box in the Leitstand user interface.
 */
public class DictionaryInfo extends ValueObject {

	/**
	 * Returns a builder to create an immutable <code>DictionarySettings</code> value object.
	 * @return a builder to create a <code>DictionarySettings</code> value object.
	 */
	public static Builder newDictionaryInfo() {
		return new Builder();
	}
	
	public static class BaseDictionaryBuilder<T extends DictionaryInfo, B extends BaseDictionaryBuilder<T,B>>{
		
		protected T dictionary;
		
		protected BaseDictionaryBuilder(T settings) {
			this.dictionary = settings;
		}
		
		/**
		 * Sets the dictionary ID
		 * @param id the dictionary ID
		 * @return a reference to this builder to continue with the object creation
		 */
		public B withDictionaryId(DictionaryId id) {
			assertNotInvalidated(getClass(), dictionary);
			((DictionaryInfo)dictionary).dictionaryId = id;
			return (B) this;
		}

		/**
		 * Sets the dictionary name
		 * @param name the dictionary name
		 * @return a reference to this builder to continue with the object creation
		 */
		public B withDictionaryName(DictionaryName name) {
			assertNotInvalidated(getClass(), dictionary);
			((DictionaryInfo)dictionary).dictionaryName = name;
			return (B) this;
		}
		
		/**
		 * Sets the dictionary description
		 * @param description the dictionary description
		 * @return a reference to this builder to continue with the object creation
		 */
		public B withDescription(String description) {
			assertNotInvalidated(getClass(), dictionary);
			((DictionaryInfo)dictionary).description = description;
			return (B) this;
		}

		public T build() {
			try {
				assertNotInvalidated(getClass(), dictionary);
				return dictionary;
			} finally {
				this.dictionary = null;
			}
		}

	}

	public static class Builder extends BaseDictionaryBuilder<DictionaryInfo, Builder>{
		public Builder() {
			super(new DictionaryInfo());
		}
	}
	
	private DictionaryId dictionaryId = randomDictionaryId();
	private DictionaryName dictionaryName;
	private String description;
	
	/**
	 * Returns the dictionary ID.
	 * @return the dictionary ID.
	 */
	public DictionaryId getDictionaryId() {
		return dictionaryId;
	}
	
	/**
	 * Returns the dictionary name.
	 * @return the dictionary name.
	 */
	public DictionaryName getDictionaryName() {
		return dictionaryName;
	}
	
	/**
	 * Returns the dictionary description.
	 * @return the dictionary description.
	 */
	public String getDescription() {
		return description;
	}
	
}
