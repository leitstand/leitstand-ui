package io.leitstand.ui.service;

import static io.leitstand.commons.model.BuilderUtil.assertNotInvalidated;
import static java.util.Objects.requireNonNull;

import java.util.Objects;

import javax.json.bind.annotation.JsonbProperty;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import io.leitstand.commons.model.ValueObject;

public class TagInfo extends ValueObject implements Comparable<TagInfo>{

	public static Builder newTagInfo() {
		return new Builder();
	}
	
	public static class Builder {
		
		private TagInfo tag = new TagInfo();
		
		public Builder withName(String name) {
			assertNotInvalidated(getClass(), tag);
			tag.name = name;
			return this;
		}
		
		public Builder withColor(String color) {
			assertNotInvalidated(getClass(), tag);
			tag.color = color;
			return this;
		}
		
		public TagInfo build() {
			try {
				assertNotInvalidated(getClass(), tag);
				requireNonNull(tag.getName());
				return tag;
			} finally {
				tag = null;
			}
		}
		
		
	}
	
	
	@NotNull(message="{tag.required}")
	@NotEmpty(message="{tag.required}")
	@JsonbProperty("tag")
	private String name;
	private String color;
	
	
	public String getName() {
		return name;
	}
	
	public String getColor() {
		return color;
	}

	@Override
	public int compareTo(TagInfo o) {
		return getName().compareTo(o.getName());
	}
}

