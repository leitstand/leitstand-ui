# Leitstand UI Modules

The Leitstand UI consists of the UI server supplying the UI infrastructure, and 
_modules_ which contain the actual views including their controllers and client libraries.


## Main Menu
The main menu contains a list of all deployed Leitstand UI modules. 
The browser loads the main module from `/api/v1/ui/modules` and receives an array of configured modules.
Each array item contains the following attributes:

- `module`, the module name
- `label`, the module label displayed in the main menu tab.
- `title`, the module title displayed in the header
- `subtitle`, the module subtitle displayed in the header below the title
- `path`, the path to the module welcome page
- `rolesAllowed`, list of roles that are allowed to access this module
  * the role name   
- `position`, optional tab position hint which is either `left` or `right`. Defaults to `left`. 



## Module
A Leitstand module encompasses controllers, client libraries, view templates, and the module descriptor.

### Module Descriptor
The Leitstand module descriptor describes the menus of a Leitstand module in a single YAML file.
The browser loads the module descriptor from `/api/v1/ui/modules/{module}` where `{module}` is the placeholder for the module name.

The basic structure of module descriptor is outline below:

- `name`, the module name
- `applications`, optinal list of module applications. 
   Unlisted applications are loaded on demand.
  * `app`, the application name
  * `controller`, the controller name. Defaults to `controller.js`.
  * `defer`, a flag to defer loading the application until the first view is accessed. Defaults to `false`.
    This allows to rename the controller but preserves to load the application only on demand.
- `navigation`, the module navigation as array of menus
   * `menu`, the menu name
   * `label`, the menu label. The label is either a static text or a template expression that reads data from the view model (e.g. `label:"{{group_name}}"` use the value of the `group_name` property as label.
   * `title`, the menu title, displayed as tooltip
   * `requires`, optional array of properties that have to be present in the view model to activate the menu.
     - the property name
   * `query`, optional query parameters, that have to be added to every view in this menu. The key is the parameter name, the value is the parameter value. The value is either a static value or an epxression to read the value from the view model (i.e. `group: "{{group_id}}"` reads the `group_id` property from the view model as value of the `group` query parameter).
   * `items`, the menu items
     * `name`, the name of the menu item
     * `label`, the label of the menu item. Again the label can either be static text or derived from view model properties.
     * `title`, the title of the label menu item, displayed as tooltip
     * `view`, the path to the view template.
     * `query`, specific query parameters for this view item. The query parameters are added to the menu query parameters. The query parameters of a menu item override the menu query parameter in case of a name clash.
     
     
### Module Applications

A Leitstand module itself can be divided into multipe _applications_.
Applications form the smallest assembly unit of the Leitstand UI.
An application is represented by a sub-folder of the module folder.
All resources of an application are located in this sub-folder.
This allows the Leitstand UI to load module resources from different containers.

For example, say the _topology_ application visualizes the network topology of the elements in the resource inventory and is therefore an application of the _inventory_ module, 
then all UI resources of the topology application are located in the `/ui/modules/inventory/topology` folder.
The reverse proxy gets configured to forward `/ui/modules/inventory/topology` requests to the toplogy application container.