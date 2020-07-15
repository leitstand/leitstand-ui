package io.leitstand.ui.model;

import io.leitstand.commons.LeitstandException;

/**
 * The <code>ModuleDescriptorException</code> reports a problem processing a module descriptor or 
 * a contribution to a module descriptor.
 */
public class ModuleDescriptorException extends LeitstandException {

	private static final long serialVersionUID = 1L;
	
	/**
	 * Creates a module descriptor exception.
	 * @param reason the reason code
	 * @param arguments optional error message arguments
	 */
	public ModuleDescriptorException(ReasonCode reason, Object... arguments) {
		super(reason,arguments);
	}

	/**
	 * Creates a module descriptor exception.
	 * @param cause the root cause
	 * @param reason the reason code
	 * @param arguments optional error message arguments
	 */
	public ModuleDescriptorException(Exception cause, ReasonCode reason, Object... arguments) {
		super(cause, reason, arguments);
	}

}
