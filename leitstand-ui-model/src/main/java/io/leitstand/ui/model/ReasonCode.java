package io.leitstand.ui.model;

import java.text.MessageFormat;
import java.util.Arrays;
import java.util.ResourceBundle;

import io.leitstand.commons.Reason;

public enum ReasonCode implements Reason {

	UIM0001E_CANNOT_PROCESS_MODULE_DESCRIPTOR,
	UIM0002E_CANNOT_PROCESS_MODULE_EXTENSION,
	UIM0003I_MODULE_DESCRIPTOR_LOADED,
	UIM0004I_MODULE_EXTENSION_LOADED;

	private static final ResourceBundle MESSAGES = ResourceBundle.getBundle("UIModuleDescriptorMessages");
	
	/**
	 * {@inheritDoc}
	 */
	public String getMessage(Object... args){
		try{
			String pattern = MESSAGES.getString(name());
			return MessageFormat.format(pattern, args);
		} catch(Exception e){
			return name() + Arrays.asList(args);
		}
	}	
}
