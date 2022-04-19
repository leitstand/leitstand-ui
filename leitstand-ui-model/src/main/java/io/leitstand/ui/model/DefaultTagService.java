package io.leitstand.ui.model;

import static io.leitstand.commons.db.DatabaseService.prepare;
import static io.leitstand.ui.service.ReasonCode.LUI0010I_TAG_NOT_FOUND;
import static io.leitstand.ui.service.TagInfo.newTagInfo;

import java.util.Date;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

import javax.inject.Inject;

import io.leitstand.commons.EntityNotFoundException;
import io.leitstand.commons.db.DatabaseService;
import io.leitstand.commons.model.Service;
import io.leitstand.model.Leitstand;
import io.leitstand.ui.service.ReasonCode;
import io.leitstand.ui.service.TagInfo;
import io.leitstand.ui.service.TagService;

/**
 * Default {@link TagService} implementation.
 */
@Service
public class DefaultTagService implements TagService{

	private DatabaseService db;
	
	protected DefaultTagService() {
		// CDI
	}
	
	@Inject
	protected DefaultTagService(@Leitstand DatabaseService db) {
		this.db = db;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public SortedSet<TagInfo> getTags() {
		return new TreeSet<>(
				db.executeQuery(prepare("SELECT name,color FROM leitstand.tag"), 
								rs -> newTagInfo()
									  .withName(rs.getString(1))
									  .withColor(rs.getString(2))
									  .build()));
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void storeTag(TagInfo tag) {
		Date now = new Date();
		db.executeUpdate(prepare("INSERT INTO leitstand.tag (name,color,tsmodified) "+
								 "VALUES (?,?,?) "+
								 "ON CONFLICT name "+
								 "DO UPDATE "+
								 "SET color=?", 
								 tag.getName(), 
								 tag.getColor(),
								 now,
								 tag.getColor()));	
	}
	
	/**
	 * {@inheritDoc}
	 */
	@Override
	public TagInfo getTag(String name) {
		TagInfo tag = db.getSingleResult(prepare("SELECT name,color  "+
												 "FROM leitstand.tag "+
												 "WHERE name=?",name),
						   				rs -> newTagInfo()
						   					  .withName(rs.getString(1))
						   					  .withColor(rs.getString(2))
						   					  .build());
		
		if (tag == null) {
			throw new EntityNotFoundException(LUI0010I_TAG_NOT_FOUND, name);
		}
		return tag;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void storeTags(Set<TagInfo> tags) {
		for (TagInfo tag : tags) {
			storeTag(tag);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void removeTag(String name) {
		db.executeUpdate(prepare("DELETE FROM leitstand.tag WHERE name=?",
				 		 		 name));
	}
	
}
