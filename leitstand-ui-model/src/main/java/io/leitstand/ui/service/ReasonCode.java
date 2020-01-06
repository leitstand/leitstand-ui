/*
 * (c) RtBrick, Inc - All rights reserved, 2015 - 2019
 */
package io.leitstand.ui.service;

import java.text.MessageFormat;
import java.util.Arrays;
import java.util.ResourceBundle;

import io.leitstand.commons.Reason;

public enum ReasonCode implements Reason{
	
	LUI0001E_DICTIONARY_NOT_FOUND,
	LUI0002I_DICTIONARY_STORED,
	LUI0003I_DICTIONARY_REMOVED;

	private static final ResourceBundle MESSAGES = ResourceBundle.getBundle("UIMessages");
	
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
