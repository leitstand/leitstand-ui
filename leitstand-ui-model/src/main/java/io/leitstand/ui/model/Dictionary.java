/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.model;

import static java.util.Collections.unmodifiableList;

import java.util.List;

import javax.persistence.AttributeOverride;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

import io.leitstand.commons.model.Query;
import io.leitstand.commons.model.VersionableEntity;
import io.leitstand.ui.jpa.DictionaryNameConverter;
import io.leitstand.ui.service.DictionaryEntry;
import io.leitstand.ui.service.DictionaryId;
import io.leitstand.ui.service.DictionaryName;

@Entity
@Table(schema="leitstand", name="dictionary")
@NamedQuery(name="Dictionary.findByName",
			query="SELECT d FROM Dictionary d WHERE d.name=:name")
@NamedQuery(name="Dictionary.findById",
			query="SELECT d FROM Dictionary d WHERE d.uuid=:uuid")
@NamedQuery(name="Dictionary.findByNamePattern",
			query="SELECT d FROM Dictionary d WHERE CAST(d.name as text) REGEXP :pattern ORDER BY d.name")

public class Dictionary extends VersionableEntity {

	private static final long serialVersionUID = 1L;

	public static Query<List<Dictionary>> findDictionariesByNamePattern(String pattern){
		return em -> em.createNamedQuery("Dictionary.findByNamePattern",Dictionary.class)
					   .setParameter("pattern", pattern)
					   .getResultList();
	}
	
	public static Query<Dictionary> findDictionaryByName(DictionaryName name){
		return em -> em.createNamedQuery("Dictionary.findByName",Dictionary.class)
					   .setParameter("name", name)
					   .getSingleResult();
	}
	
	public static Query<Dictionary> findDictionaryById(DictionaryId id){
		return em -> em.createNamedQuery("Dictionary.findById",Dictionary.class)
					   .setParameter("uuid", id.toString())
					   .getSingleResult();
	}

	
	@Convert(converter=DictionaryNameConverter.class)
	private DictionaryName name;
	private String description;
	@ElementCollection
	@AttributeOverride(name="defaultValue", column=@Column(name="default"))
	@CollectionTable(schema="leitstand", name="dictionary_entry")
	private List<DictionaryEntry> entries;
	
	protected Dictionary() {
		super();
	}
	
	public Dictionary(DictionaryId dictionaryId,
					  DictionaryName dictionaryName) {
		super(dictionaryId.toString());
		this.name = dictionaryName;
	}
	
	
	public DictionaryId getDictionaryId() {
		return DictionaryId.valueOf(getUuid());
	}
	
	public void setDictionaryName(DictionaryName name) {
		this.name = name;
	}
	
	public DictionaryName getDictionaryName() {
		return name;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setEntries(List<DictionaryEntry> entries) {
		this.entries = entries;
	}
	
	public List<DictionaryEntry> getEntries() {
		return unmodifiableList(entries);
	}
	
}