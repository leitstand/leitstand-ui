# Leitstand UI Controller

The controller invokes the REST API, 
translates the response entity into the view model, 
passes the view model to the view template in order to render the view and 
subscribes all events from the view to process them accordingly.

## ViewController Class

The `ViewController` is parameterized by a JSON object representing the controller configuration.
The minimal configuration consists merely of the resource the controller should invoke.
A typical controller configuration contains the following properties:
- `resource`, the main `Resource` the controller is operating on. The controller invokes the `load` method of the declared resource to initialize the view. 
- `viewModel`, an optional callback to translate the resource entity into the view model.
- `postRender`, an optional callback to augment the rendered view with additional information (e.g. augment an interface list with telemetry data from a time series database).
- `buttons`, an optional associative array of callback functions to handle button click events. The button name is used as key, the callback function to handle the click is the array value.
- `onSuccess`, `onRemoved`, `onCreated` event handlers to process the outcome of a successful REST API invocation.

The controller configuration is bound to the `ViewController` instance.
By that the controller configuration has access to the convenience methods provided by the `ViewController`.
The most frequently controller methods are
- `this.location` to read the current location including query parameters.
- `this.getViewModel` to read the view model and extract the data to be passed to the REST API.
- `this.navigate` to navigate to a different view.
- `this.reload` to reload the current view.

More details about the `ViewController` methods and the configuration object can be found in the controller JSDoc.

A controller is created by a factory method.
The factory method creates the resource and the view controller.



## Menu


## Module