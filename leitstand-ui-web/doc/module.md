# Leitstand UI Modules

The Leitstand UI consists of the UI server supplying the UI infrastructure, and 
_modules_ which contain the actual views including their controllers and client libraries.


## Main Menu
The main menu contains a list of all deployed Leitstand UI modules. 
The browser loads the main menu from `/api/v1/ui/modules` and receives an array of configured modules.
Each array item contains the following attributes:

- `module`, the module name
- `label`, the module label displayed in the main menu tab.
- `title`, the module title displayed in the header
- `subtitle`, the module subtitle displayed in the header below the title
- `path`, the path to the module welcome page
- `scopesAllowed`, list of scopes that are allowed to access this module. The scopes are stored in the scope claim of the access token.
  * the role name   
- `position`, optional tab position hint which is either `left` or `right`. Defaults to `left`. 



## Module
A Leitstand module encompasses controllers, client libraries, view templates, and the module descriptor.

### Module Descriptor
The Leitstand module descriptor describes the menus of a Leitstand module in a single YAML file.
The browser loads the module descriptor from `/api/v1/ui/modules/{module}` where `{module}` is the placeholder for the module name.

The basic structure of module descriptor is outline below:

- `name`, the module name
- `applications`, optional list of module applications. 
   Unlisted applications are loaded on demand.
  * `app`, the application name
  * `controller`, the controller name. Defaults to `controller.js`.
  * `defer`, a flag to defer loading the application until the first view is accessed. Defaults to `false`.
    This allows to rename the controller but preserves to load the application only on demand.
- `menus`, the module navigation as array of menus
   * `menu`, the menu name
   * `category`, an optional menu category. Defaults to _module_. The category allows to filter for menus. This enables UI components to process menus of a certain category only.
   * `label`, the menu label. The label is either a static text or a template expression that reads data from the view model (e.g. `label:"{{group_name}}"` use the value of the `group_name` property as label.
   * `title`, the menu title, displayed as tooltip
   * `requires`, optional array of properties that have to be present in the view model to enable the menu.
     - the property name
   * `viewModel`, optional array of view model property matchers providing more sophisticated means to enable the menu  
     - `property`, the view model property name
     - `exists`, an optional boolean flag indicating whether the property must be present (`true`) or absent (`false`) to enable the menu.
     - `matches`, an optional regular expression to enable the menu if the view model property value matches the regular expression.
     - `matches_not`, an optional regular expression to enable the menu if the view model property does not match the regular expression
   * `query`, optional query parameters, that have to be added to every view in this menu. The key is the parameter name, the value is the parameter value. The value is either a static value or an expression to read the value from the view model (i.e. `group: "{{group_id}}"` reads the `group_id` property from the view model as value of the `group` query parameter).
   * `items`, the menu items
     * `item`, the name of the menu item
     * `category`, an optional menu item category. The category allows to filter for menu items. This enables UI components to process menu items of a certain category only.
     * `label`, the label of the menu item. Again the label can either be static text or derived from view model properties.
     * `title`, the title of the label menu item, displayed as tooltip
     * `view`, the path to the view template.
     * `requires`, optional array of properties that have to be present in the view model to enable the menu item.
       - the property name
     * `viewModel`, optional array of view model property matchers providing more sophisticated means to enable the menu item  
       - `property`, the view model property name
       - `exists`, an optional boolean flag indicating whether the property must be present (`true`) or absent (`false`) to enable the menu item.
       - `matches`, an optional regular expression to enable the menu item if the view model property value matches the regular expression.
       - `matches_not`, an optional regular expression to enable the menu item if the view model property does not match the regular expression
     * `query`, specific query parameters for this view item. The query parameters are added to the menu query parameters. The query parameters of a menu item override the menu query parameter in case of a name clash.
     
     
### Module Applications

A Leitstand module can contain _applications._
Each application is represented by a sub-folder in the module folder.
All application resources are stored in this folder.

For example, say the _topology_ application visualizes the network topology of the elements in the resource inventory and is therefore an application of the _inventory_ module, 
then all UI resources of the topology application are located in the `/ui/modules/inventory/topology` folder.

Each application can add menus to the module and/or add new menu items to existing menus.
All extensions are typically outlined in the _menu.yaml_ file.

- `provider` optional string to describe who provides this application. Set to leitstand.io for all Leitstand applications.
- `description` optional description of the application
- `controller` optional application controller file. Defaults to _controller.js_.
- `scopesAllowed` list of scopes that are allowed to interface with this application. 
- `config` optional JSON object that is applied to all configured menus and menu items and send to the client to configure the application and/or application views.
- `extensions` list of module menu extensions.
  * `extend` the extension point
     - `module` the name of the module that gets extended
     - `menu` optional menu being extended
     -  `after` a hint _after_ which existing menu or menu item the extension shall be added
     - `before` a hint _before_ which existing menu or menu item the exension shall be added
  * `menus` the menus to be added to the module. Only applicable if no menu is specified in the extension point.
  * `items` the menu items to be added to the module menu. Only applicable if a menu is specified in the extension point.
  
### Module Discovery

Module and application discovery relies on CDI producers.
A `ModuleDescriptor` producer reads the module descriptor and optionally adds known applications.
A `Contribution` producer reads a contribution descriptor to add an application an existing module.


The listing below shows the CDI producer of the image module descriptor.

```Java
package io.leitstand.inventory.ui;

/**
 * Image UI module loader.
 * <p>
 * Loads the image module descriptor.
 */
@Dependent
public class ImageModule {

  private static final Logger LOG = Logger.getLogger(ImageModule.class.getName()); 
  
  /**
   * Loads the image module descriptor.
   * @return the image module descriptor.
   */
  @Produces
  public ModuleDescriptor getImageModule() {
    try {
      return readModuleDescriptor(currentThread()
                                  .getContextClassLoader()
                                  .getResource("/META-INF/resources/ui/modules/image/module.yaml"))
             .build();
    } catch (IOException e) {
      LOG.severe(format("%s: Cannot read image module. Reason: %s",
                        UIM0001E_CANNOT_PROCESS_MODULE_DESCRIPTOR.getReasonCode(),
                        e.getMessage()));
      LOG.log(FINE,e.getMessage(),e);
      throw new ModuleDescriptorException(e,
                                          UIM0001E_CANNOT_PROCESS_MODULE_DESCRIPTOR,
                                          "image");
    }
  }
}
```

The next listing shows the CDI producer of the inventory module descriptor.
The producer adds the default inventory module applications to the descriptor.

```Java
package io.leitstand.inventory.ui;

/**
 * Inventory UI module loader.
 * <p>
 * Loads the inventory module descriptor and all default applications.
 */
@Dependent
public class InventoryModule  {
  
  /** Inventory module path template. */
  private static final String MODULE_PATH = "/META-INF/resources/ui/modules/inventory/%s";
  private static final String MODULE_NAME = "inventory";
  
  private static final Logger LOG = Logger.getLogger(InventoryModule.class.getName());

  /**
   * Loads a default inventory application.
   * @param path the application configuration
   * @return the contribution defined by the application
   */
  static Contribution contribution(String path) {
    String contrib = path.substring(0,path.lastIndexOf('/'));
    try {
      ClassLoader cl =  currentThread().getContextClassLoader();
      return loadContribution(cl.getResource(format(MODULE_PATH,path)))
             .withBaseUri(contrib)
             .build();
    } catch (Exception e) {
      LOG.severe(format("%s: Cannot process contribution %s for module %s. Reason; %s",
                        UIM0002E_CANNOT_PROCESS_MODULE_EXTENSION.getReasonCode(),
                        contrib,
                        MODULE_NAME,
                        e.getMessage()));
      LOG.log(FINE,e.getMessage(),e);
      throw new ModuleDescriptorException(e,
                                          UIM0002E_CANNOT_PROCESS_MODULE_EXTENSION,
                                          MODULE_NAME,
                                          contrib);
    }
  }
  
  /**
   * Creates the <code>ModuleDescriptor</code> including all existing default applications.
   * @return the inventory module descriptor.
   */
  @Produces
  public ModuleDescriptor getInventoryModule(){
    
    try {
      URL moduleDescriptor =  currentThread()
                              .getContextClassLoader()
                              .getResource(format(MODULE_PATH,"module.yaml"));
      // Load default inventory applications
      Contribution podContrib      = contribution("pod/menu.yaml");
      Contribution elementContrib  = contribution("element/menu.yaml");
      Contribution configContrib   = contribution("config/menu.yaml");
      Contribution dnsContrib      = contribution("dns/menu.yaml");
      Contribution platformContrib = contribution("platform/menu.yaml");
      Contribution roleContrib     = contribution("role/menu.yaml");
      
      return readModuleDescriptor(moduleDescriptor)
             .withContributions(podContrib,
                                elementContrib,
                                configContrib,
                                dnsContrib,
                                platformContrib,
                                roleContrib)
             .build();
    } catch (IOException e) {
      LOG.severe(format("%s: Cannot process contribution %s for module %s. Reason; %s",
                        UIM0001E_CANNOT_PROCESS_MODULE_DESCRIPTOR.getReasonCode(),
                        MODULE_NAME,
                        e.getMessage()));
      LOG.log(FINE,e.getMessage(),e);
      throw new ModuleDescriptorException(e,
                                          UIM0001E_CANNOT_PROCESS_MODULE_DESCRIPTOR,
                                          MODULE_NAME);
    }
  }
}
```
The inventory module descriptor is listed below.
The inventory module descriptor defines the main menu to open pod, element and interface list views and an empty meta menu for metadata administration.
Each application can extend the meta menu.

```yaml
module: inventory
menus:
- menu: main
  items:
  - item: pods
    label: Pods
    title: Search all pods in the network
    scopesAllowed:
    - ivt
    - ivt.read
    - ivt.group
    - ivt.group.read
    view: pods.html
  - item: elements
    label: Elements
    title: Search all elements in the network
    scopesAllowed:
    - ivt
    - ivt.read
    - ivt.element
    - ivt.element.read
    view: elements.html
  - item: ifps
    label: Interfaces
    title: Search all physical interfaces in the network
    scopesAllowed:
    - ivt
    - ivt.read
    - ivt.element
    - ivt.element.read
    view: ifps.html
- menu: meta
  label: Administration
  title: Maintain roles and platforms
  scopesAllowed:
  - ivt
  - ivt.read
  - ivt.element
  - ivt.element.read
```

Lets look at the pod, element and DNS applications as examples.
The pod application allows to manage the pod settings and adds the pod menu to the inventory module.

```yaml
name: pod
provider: leitstand.io
controller: controller.js
description: Pod settings view.
extensions:
- extend:
    module: inventory
    after: main
menus:
  - menu: pod
    label: "{{group_name}}"
    title: Explore the settings and elements of a certain PoD
    scopesAllowed:
    - ivt
    - ivt.read
    - ivt.group
    - ivt.group.read
    requires:
    - group_id
    query:
      group: "{{group_id}}"
    items:
    - item: pod-settings
      label: Pod Settings
      title: Manage the general settings of the PoD
      view: pod.html
    - item: pod-location
      label: Location
      title: Manage the physical location of the PoD
      view: pod-location.html
    - item: pod-elements
      label: Elements
      title: Lists all elements of the PoD
      view: pod-elements.html
    - item: racks
      label: Racks
      title: Manage PoD racks
      view: pod-racks.html
``` 

The element application allows to manage and inspect element settings. 
The application adds the element menu to manage and inspect element settings.

The DNS application allows to manage DNS records for each element. 
It adds a new item to the main menu to list all known DNS zones, 
adds a menu to manage a DNS zone 
and adds a DNS record menu item to the element menu.

```yaml
provider: leitstand.io
description: DNS record management views
controller: controller.js
extensions:
# Add main menu item to list all DNS zones.
- extend: 
    module: inventory
    menu: main
    after: ifps
  items:
  - item: dns
    label: DNS Zones
    title: Manage DNS zones
    scopesAllowed:
    - ivt
    - ivt.read
    - ivt.element
    - ivt.element.read
    - ivt.element.dns
    view: zones.html
# Add DNS record menu item to the element menu
- extend:
    module: inventory
    menu: element
    after: configuration
  items:
  - item: DNS
    label: DNS
    title: Manage DNS records
    view: element-dns-records.html
# Add menu to manage a DNS zone     
- extend:
    module: inventory
    after: main
  menus:
  - menu: dns
    label: DNS Zone
    title: Manage a DNS Zone
    scopesAllowed:
      - ivt
      - ivt.read
      - ivt.element
      - ivt.element.read
    requires:
    - dns_zone_id
    query:
     zone: "{{dns_zone_id}}"
    items:
    - item: zone-settings
      label: Settings
      title: Manage DNS zone settings
      view: zone-settings.html
    - item: zone-elements
      label: Elements
      title: View elements with DNS records bound to this zone
      view: zone-elements.html          
```


The next listing shows the contribution of the topology application to the inventory module.
The topology application adds a new menu item to the element inventory menu.

```Java
package io.leitstand.app.topology.ui;

/**
 * The topology viewer displays the link-state graph of a fabric.
 */
@Dependent
public class TopologyViewer {

  private static final Logger LOG = Logger.getLogger(TopologyViewer.class.getName());

 /**
  * Returns the topology viewer descriptor.
  * @return the topology viewer descriptor.
  */
  @Produces
  public Contribution getTopologyViewer() {
    try {
      return loadContribution(currentThread()
                              .getContextClassLoader()
                              .getResource("/META-INF/resources/ui/modules/inventory/topology/menu.yaml"))
             .withBaseUri("topology")
             .build();
    } catch (IOException e) {
      LOG.warning(() -> format("%s: Cannot load topology viewer: %s", 
                               UIM0002E_CANNOT_PROCESS_MODULE_EXTENSION.getReasonCode(), 
                               e.getMessage()));
      throw new ModuleDescriptorException(e,
                                          UIM0002E_CANNOT_PROCESS_MODULE_EXTENSION,
                                          "topology");    
    }
  }
}
```

The topology viewer descriptor is listed below. 
It adds a new menu item to the pod menu to open the link state graph for the selected pod.

```yaml
name: topology
provider: rtbrick.com
controller: controller.js
description: Fabric link-state graph visualizer
# Add link-state graph menu item to pod menu.
extensions:
- extend:
    module: inventory
    menu: pod
    after: racks
  items:
  - item: link-state
    label: Link State Graph
    title: Inspect the link state graph of a fabric
    view: link-state.html
```


