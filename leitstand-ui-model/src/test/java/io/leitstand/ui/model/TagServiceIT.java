package io.leitstand.ui.model;

import static io.leitstand.testing.ut.LeitstandCoreMatchers.isEmptySet;
import static io.leitstand.testing.ut.LeitstandCoreMatchers.reason;
import static io.leitstand.ui.service.ReasonCode.LUI0010I_TAG_NOT_FOUND;
import static org.junit.Assert.assertThat;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import io.leitstand.commons.EntityNotFoundException;
import io.leitstand.ui.service.TagService;

public class TagServiceIT extends LeitstandIT{

	@Rule
	public ExpectedException exception = ExpectedException.none();
	
	
	private TagService service;
	
	@Before
	public void createTagService() {
		service = new DefaultTagService(getDatabase());
	}
	
	@Test
	public void throw_entity_not_found_exception_when_tag_does_not_exist() {
		exception.expect(EntityNotFoundException.class);
		exception.expect(reason(LUI0010I_TAG_NOT_FOUND));
		service.getTag("unknown tag");
	}
	
	@Test
	public void return_empty_list_if_no_tags_exist() {
		assertThat(service.getTags(), isEmptySet());
	}
	
	// NOTE: H2 does not support ON CONFLICT clause. Store and remove cannot be tested as a consequence.
	
}
