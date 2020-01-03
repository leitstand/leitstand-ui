/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;

import io.leitstand.commons.model.ValueObject;

public class ViewModelProperty extends ValueObject {
	
	public static class  Builder {
		
		private ViewModelProperty property = new ViewModelProperty();
		
		public Builder withProperty(String name) {
			assertNotInvalidated(getClass(), property);
			property.property = name;
			return this;
		}
		
		public Builder withExists(boolean exists) {
			assertNotInvalidated(getClass(), property);
			property.exists = exists;
			return this;
		}
		
		public Builder withMatches(String pattern) {
			assertNotInvalidated(getClass(), property);
			property.matches = pattern;
			return this;
		}
		
		public Builder withMatchesNot(String pattern) {
			assertNotInvalidated(getClass(), property);
			property.matchesNot = pattern;
			return this;
		}
		
		public ViewModelProperty build() {
			try {
				assertNotInvalidated(getClass(), property);
				return property;
			} finally {
				this.property = null;
			}
		}
		
	}
	
	private String property;
	private Boolean exists;
	private String matches;
	private String matchesNot;
	
	public String getProperty() {
		return property;
	}
	
	public Boolean isExists() {
		return exists;
	}
	
	public String getMatches() {
		return matches;
	}
	
	public String getMatchesNot() {
		return matchesNot;
	}
}
