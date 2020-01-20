/*
 * Copyright 2020 RtBrick Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License.  You may obtain a copy
 * of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
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
