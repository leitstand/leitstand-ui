# Leitstand UI Error Handling


The Leistand UI error handling relies on the HTTP status code and status messages returned by the REST API. 
The REST API uses the HTTP Status Code in combination with optional status messages to explain the outcome of an API invocation. A status message is a JSON object and contains the following attributes:

- `severity`, the message severity which is either `ERROR`, `WARNING`, or `INFORMATION`.
- `reason`, a unique, 8-digit reason code which allows to understand why the message was created.
- `message`, the status details in a human-friendly format
- `property`, an optional property name which is set when the message is related to a property of the request entity.

## Input Error
The Leitstand UI tries to find a matching input field if the `property` property is present.
The discovered input field is highlighted, focused and the error messages is displayed next to the input field.




## Flash Messages
All other messages, which cannot be assigned to an input field, are displayed as flash messages,
with different coloring per message severity.


## Customized Error Handling
Each controller can replace the default event handlers by custom event handlers in order to implement a custom error handling. 
See the [controller documentation](controller.md) for further information.




