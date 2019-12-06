# Leitstand REST API

The REST-API models the server-side resources including their supplied operations.
Each module adds a library to model the existing REST API resources.

## Resource Class

The `Resource` class is the base class for server-side resources and
provides a _fluent_ API to compose a REST-API invocation.

The `resource` method forms the generic entry point to compose a request.
The most important methods to build a request are:
- `resource` to start the request composition and set the request URI
- `contentType` to set the content type of the request entity
- `accept` to set the expected content type of the response entity
- `header` to set arbitrary HTTP request headers
- `map` a function to translate the response entity text to something else
- `GET`, `PUT`, `POST`, and `DELETE` to select the HTTP request method

The listing below composes a `HTTP GET` request to read element settings.
The element is identified by the `element` attribute in the `context` object.
The `handler` function processes the response entity.

```Javascript
this.resource("/api/v1/elements/{{element}}/settings", context)
    .contentType("application/json") 
    .accept("application/json") // Accept JSON response entity
    .map(JSON.parse) // Map response entity to JSON object graph
    .GET(handler);
```
The vast majority of resources exchange JSON messages, 
Hence the `json` alias was introduced to simplify the previous listing to the listing below.

```Javascript
this.json("/api/v1/elements/{{element}}/settings", context)
    .GET(handler);
```

Similar aliases exist for plain text (`textPlain`) and HTML (`html`).

### HTTP Status Code Handlers
The resource supports the registration of callbacks to handle specific HTTP status codes.
For example, `onNotFound` is called when the requested resource does not exist.
`onError` is a generic error handler if no specific handler was registered.
A complete overview of existing callbacks can be found in the Resource JSDoc.


### Premise Support
`GET`, `PUT`, `POST`, and `DELETE` return a `Premise` object, 
which allows to `await` the completion of a request in an `async` function.


## Modeling a REST API Resource 

A REST API resource is modeled by extending the `Resource` class and adding a method for each operation provided by the resource.

__Convention:__ _Each resource provides a `load` method to load the resource from the server._

The listing below shows the `Webhooks` resource implementation to access the collection of configured webhooks.
The `load` method loads all webhooks that match the specified filter, which is a regular expression to filter for the webhook names.
The `addHook` method adds a new webhook.

```ES6
/**
 * Collection of configured webhooks.
 */
export class Webhooks extends Resource {

  /**
   * Loads all configured webhooks
   * @returns {Promise} a promise to process the webhook collection or an error response
   * @see WebhookReference
   */
  load(params) {
    return this.json('/api/v1/webhooks?filter={{filter}}',
                     params)
               .GET();
  }

  /**
   * Adds a new webhook.
   * @param {WebhookSettings} settings the webhook settings
   */
   addHook(settings){
   	return this.json("/api/v1/webhooks/")
   	           .POST(settings);
   }
}
```


### Async/Await Resource Invocation

It is utmost important that every method returns the `Premise` to preserve the `Premise` support.
The listing below outlines how a `async` function awaits the completion of the HTTP request.

```ES6
async function(){
  let webhooks = new Webhooks();
  let hooks = await webhooks.load({"filter":".*"});
  // Process the hooks...
}

```

### Resource Invocation With Callback

The listing below outlines how to use the `Webhooks` resource to add a new webhook and register a callback to get notified about the created webhook.

```ES6
// Create new webhook
let hook = {
  "hook_name":"tutorial",
  "description":"A dummy hook to explain the resource concept",
  ...
};

// Create Webhooks resource.
let webhooks = new Webhooks();
webhooks.onCreated=function(){
  // Navigate to the created webhook detail page
);
webhooks.onError=function(message){
  // Report the error.
};
// Try to add the new webhook.
webhooks.addHook(hook);
```







