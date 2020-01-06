/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.jsonb;

import static java.util.Arrays.asList;
import static java.util.UUID.randomUUID;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.util.Collection;

import javax.json.bind.adapter.JsonbAdapter;
import javax.json.bind.annotation.JsonbTypeAdapter;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import io.leitstand.commons.model.Scalar;
import io.leitstand.ui.service.DictionaryId;
import io.leitstand.ui.service.DictionaryName;

@RunWith(Parameterized.class)
public class StringScalarAdapterTest {

	@Parameters
	public static Collection<Object[]> adapters(){
		String uuid = randomUUID().toString();
		Object[][] adapters = new Object[][]{
			{new DictionaryIdAdapter(),		 		uuid, 					new DictionaryId(uuid)},
			{new DictionaryNameAdapter(),			"unit-dict", 			new DictionaryName("unit-dict")}
		};
		return asList(adapters);
	}
	
	
	private JsonbAdapter<Scalar<String>,String> adapter;
	private Scalar<String> scalar;
	private String value;
	
	public StringScalarAdapterTest(JsonbAdapter<Scalar<String>,String> adapter,
								   String value,
								   Scalar<String> scalar) {
		this.adapter = adapter;
		this.value = value;
		this.scalar = scalar;
		
	}
	
	@Test
	public void empty_string_is_mapped_to_null() throws Exception {
		assertNull(adapter.getClass().getSimpleName(), 
				   adapter.adaptFromJson(""));
	}
	
	@Test
	public void null_string_is_mapped_to_null() throws Exception {
		assertNull(adapter.getClass().getSimpleName(),
				   adapter.adaptFromJson(null));
	}
	
	@Test
	public void adapt_from_json() throws Exception{
		assertEquals(adapter.getClass().getSimpleName(),
					 scalar,adapter.adaptFromJson(value));
	}
	
	@Test
	public void adapt_to_json() throws Exception {
		assertEquals(adapter.getClass().getSimpleName(),
					 value,adapter.adaptToJson(scalar));
	}
	
	@Test
	public void null_scalar_is_mapped_to_null() throws Exception{
		assertNull(adapter.adaptToJson(null));
	}
	
	@Test
	public void jsonb_adapter_annotation_present() {
		assertTrue(scalar.getClass().isAnnotationPresent(JsonbTypeAdapter.class));
		assertSame(adapter.getClass(),scalar.getClass().getAnnotation(JsonbTypeAdapter.class).value());
	}
}
