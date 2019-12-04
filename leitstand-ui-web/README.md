# Leitstand User Interface

This project contains the Leitstand UI foundation classes. 
The Leitstand UI is implemented as single-page application and operates on the REST-API provided by Leitstand modules and applications.

## Model View Controller
The Leitstand UI obeys the Model-View-Controller pattern as illustrated below.

![Model View Controller](ui-mvc.png "Model View Controller principle") 

The [controllers](controllers.md) form the centerpieces of the UI. 
A controller invokes the [REST-API](resources.md), translates the server-side resource into the view model, 
passes the view model to the [view template](templates.md) to render the view and 
processes all events fired from controls on the view.
In addition, the controller consults the navigation in order to proceed at a different view.

The following tutorials provide a brief introduction on how to implement Leitstand UI views:

- The [List View Tutorial](listview_tutorial.md) explains how to implement a list view.
- The [Detail View Tutorial](details_tutorial.md) explains how to implement a form to manage object settings.
- The [Add Tutorial](add_tutorial.md) explains how to add a new entity to an entity collection.



## UI Modules
The UI consist of modules. 
Each tab in the main menu represents a module.
A module has full control of the screen real estate below the main menu. 


## Technology Stacks and Frameworks
The UI is implemented in vanilla ES6 and makes use of ES6 language features like modules, classes and asynchronous function, Promises and the await keyword. The component library is implemented as HTML web components.
The Primer CSS Framework is used to style the Leitstand UI.