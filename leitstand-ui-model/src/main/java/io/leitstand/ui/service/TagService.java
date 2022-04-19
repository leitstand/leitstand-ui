package io.leitstand.ui.service;

import java.util.Set;
import java.util.SortedSet;

/**
 * The <code>TagService</code> provides access to the tag metadata.
 */
public interface TagService {

	/**
	 * Stores a tag.
	 * @param tag the tag info.
	 */
	void storeTag(TagInfo tag);
	
	/**
	 * Stores a set of tags.
	 * @param tags the tags to be stored
	 */
	void storeTags(Set<TagInfo> tags);
	
	/**
	 * Returns all existing tags.
	 * @return a set of existing tags.
	 */
	SortedSet<TagInfo> getTags();
	
	/**
	 * Removes a tag.
	 * @param name the name of the tag to be removed.
	 */
	void removeTag(String name);

	/**
	 * Returns the settings for a specific tag.
	 * @param name the tag name
	 * @return the settings for the given tag.
	 */
	TagInfo getTag(String name);
	
}
