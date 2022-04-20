/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;

import java.io.Serializable;

import javax.json.bind.annotation.JsonbProperty;
import javax.persistence.Convert;
import javax.persistence.Embeddable;

import io.leitstand.commons.jpa.BooleanConverter;
import io.leitstand.commons.model.ValueObject;

/**
 * A dictionary value. 
 */
@Embeddable
public class DictionaryEntry extends ValueObject implements Serializable, Comparable<DictionaryEntry>{

	private static final long serialVersionUID = 1L;

	/**
	 * Returns a new <code>DictionaryValue</code> builder.
	 * @return a new <code>DictionaryValue</code> builder.
	 */
	public static Builder newDictionaryEntry() {
		return new Builder();
	}
	
	/**
	 * Builder to create an immutable <code>DictionaryValue</code> object.
	 */
	public static class Builder {
		
		private DictionaryEntry value = new DictionaryEntry();
		
		/**
		 * Sets the label of the dictionary value.
		 * @param label the label text
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withLabel(String label) {
			assertNotInvalidated(getClass(), value); 
			this.value.label = label;
			return this;
		}

		/**
		 * Sets the value of the dictionary value.
		 * @param label the label text
		 * @return a reference to this builder to continue with object creation
		 */
		public Builder withValue(String value) {
			assertNotInvalidated(getClass(), value); 
			this.value.value = value;
			return this;
		}
		
		/**
		 * Sets whether this dictionary entry represents the default value.
		 * @param defaultValue whether this entry represents the default value.
		 * @return a reference to this builder to continue with object creation

		 */
		public Builder withDefaultValue(boolean defaultValue) {
			assertNotInvalidated(getClass(), value); 
			this.value.defaultValue = defaultValue;
			return this;
		}
		
		/**
		 * Returns the immutable <code>DictionaryEntry</code> value object.
		 * @return the immutable <code>DictionaryEntry</code> value object.
		 */
		public DictionaryEntry build() {
			try {
				assertNotInvalidated(getClass(), value); 
				return this.value;
			} finally {
				this.value = null;
			}
		}
		
	}
	
	private String value;
	private String label;
	
	@JsonbProperty("default")
	@Convert(converter = BooleanConverter.class)
	private boolean defaultValue;

	/**
	 * Returns the dictionary value. 
	 * @return the dictionary value.
	 */
	public String getValue() {
		return value;
	}
	
	/**
	 * Returns the label of the dictionary value.
	 * Defaults to the dictionary value, if not set.
	 * @return the label of the dictionary value.
	 */
	public String getLabel() {
		if(label == null) {
			return value;
		}
		return label;
	}
	
	/**
	 * Returns whether this value is the default value.
	 * @return <code>true</code> if this value is the default value.
	 */
	public boolean isDefaultValue() {
		return defaultValue;
	}

	/**
	 * Compares two directory entries by their label and values.
	 * @param entry the entry to be compared with this entry.
	 * @returns a negative integer, zero or a positive depending on whether this entry is less than, equal or larger than the given entry. 
	 */
	@Override
	public int compareTo(DictionaryEntry entry) {
		int l = getLabel().compareTo(entry.getLabel());
		if (l != 0) {
			return l;
		}
		return getValue().compareTo(entry.getValue());
		
	}
	
}
