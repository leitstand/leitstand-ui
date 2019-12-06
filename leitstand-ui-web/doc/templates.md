# Leitstand View Templates
Leitstand view templates are a combination of mustache templates and web components.

## Mustache
Mustache is a lightweight _logic-less_ template engine.
The template merely translates the JSON view model into HTML rather than doing computations or complex conditional rendering. 

The controller creates the JSON view model, which means that all logic needed to render the view is entirely located in the controller.

Mustache omits sections if no data is present and supports to render an alternative section to report that no data is available.
Only a small set of instructions is needed to create a view template:

- `{{name}}` renders the top-level `name` view-model property and escapes all HTML control characters.
- `{{&name}}` renders the top-level `name` view-model property without escaping HTML control characters.
- `{{element.description}}` renders the `description` property of the `element` object.
  The `element` object is a top-level view-model property.
- `{{#element}}`...`{{/element}}` renders the `...` section if the `element` top-level view-model property exists. An object exists if the value is not `null`, `undefined`, `false`, `0`, an empty string , or an empty array. 
   All `element` properties can be addressed relatively, e.g. `{{#element}}{{description}}{{/element}}`. If a block is declared on an array, e.g. `{{#array}}...{{/array}}`, the `...` section is executed for each array item.
- `{{^element}}`...`{{/element}}` renders the `...` section if the top-level `element` view-model property does _not_ exist, i.e. the value is either `null`,`undefined`, `false`, `0`, an empty string, or an empty array.
- `{{.}}` allows to refer to the current context. For example, `{{#element.element_alias}}({{.}}){{/element.element_alias}}` renders the element alias in parentheses if an element alias exists.

The sample below uses all expressions from above to create a Leitstand view template.
Before looking at the template the view model needs to be defined.
The view model for the sample is shown in the listing below.
It contains an array of existing element roles, a list of existing operational states, and a list of existing administrative states as well as element settings.
The template renders the element settings as HTML form.

```JSON
{"roles":[
  {"label":"Leaf switch", "value": "LEAF"},
  {"label":"Spine switch", "value": "SPINE"}
],
"operational_states":[
  {"label":"Up","value":"UP"},
  {"label":"Down","value":"DOWN"},
  {"label":"Maintenance","value":"MAINTENANCE"}
],
"administrative_states":[
  {"label":"New","value":"NEW"},
  {"label":"Active","value":"ACTIVE"},
  {"label":"Retired","value":"RETIRED"}
],
"element":{
  "group_id":"67196b6a-4c70-418d-89c0-0cd7a82caa43",
  "group_type":"pod",
  "group_name":"BLR",
  "element_id":"900fc8d7-561d-4793-bf1c-701b9a9ba7e6",
  "element_name":"leaf1.blr",
  "element_role":"LEAF",
  "operational_state":"UP",
  "administrative_state":"ACTIVE",
  "description":"Leaf 1 in pod Bangalore",
  "tags":["BLR","lab"],
  "mgmt_interface_list":[
    {"mgmt_name":"REST",
     "mgmt_protocol":"https",
     "mgmt_hostname":"192.168.0.1"},
    {"mgmt_name":"SSH",
     "mgmt_protocol":"ssh",
     "mgmt_hostname":"192.168.0.1"}
  ]
} 
```

The listing below shows the view template to render the view.
The template leverages the UI components which are described in the next section.

```HTML
<ui-view-header>
  <ui-title>Element Settings <span class="{{element.operational_state}}">{{element.operational_state}}</span></ui-title>
  <ui-subtitle>Manage settings of element {{element.element_name}}{{#element.element_alias}} ({{.}}){{/element.element_alias}}</ui-subtitle>
</ui-view-header>
<ui-form rolesAllowed="Operator">
  <ui-group>
  <ui-label>General Settings</ui-label>
  <ui-note>Manage the element name, element alias, element role, administrative and operational state, and element description and set the pod of which the element belongs to.</ui-note>
  <ui-input name="group_name" disabled readonly bind="element.group_name">
   <ui-label>Pod Name</ui-label>
   <ui-note>The pod to which this element belongs to.
            <a href="element-pod.html?group={{group_id}}&element={{element_id}}">Move element to another pod.</a></ui-note>
    </ui-input>
    <ui-input name="element_name" bind="element.element_name">
      <ui-label>Element Name</ui-label>
      <ui-note>The unique name of the element</ui-note>
    </ui-input>
    <ui-input name="element_alias" bind="element.element_alias">
      <ui-label>Element Alias</ui-label>
      <ui-note>An optional unique alias of the element</ui-note>
    </ui-input>
    <ui-select name="element_role" bind="element.element_role" options="roles">
      <ui-label>Element Role</ui-label>
      <ui-note>Select the role of the element.</ui-note>
    </ui-select>
    <ui-select name="adm_state" bind="element.administrative_state" options="administrative_states">
      <ui-label>Administrative State</ui-label>
      <ui-note>Select the administrative state of the element.
               The administrative state of an element expresses whether the element is a <em>new</em> element, 
               that is about to be installed in the network, an already <em>active</em> element or a <em>retired</em> element, 
               that is going to be removed from the network.</ui-note>  
    </ui-select>
    <ui-select name="op_state" bind="element.operational_state" options="operational_states">
      <ui-label>Operational State</ui-label>
      <ui-note>Select the operational state of the element.</ui-note>
    </ui-select>
    <ui-textarea name="description" bind="element.description">
      <ui-label>Description</ui-label>
      <ui-note>Optional description of the element.</ui-note>
    </ui-textarea>
  </ui-group>
  <ui-group>
    <ui-label>Tags</ui-label>
    <ui-note>Optional tags to categorize the element.</ui-note>
    <ui-tags name="tags" bind="element.tags"></ui-tags>
  </ui-group>
  <ui-group>
    <ui-label>Hardware Information</ui-label>
    <ui-note>Select the hardware platform of the element and maintain the chassis serial number and the MAC address of the management interface.</ui-note>
    <element-platform name="platform" bind="element.platform" options="platforms">
      <ui-label>Hardware Platform</ui-label>
      <ui-note>The hardware platform of the element.</ui-note>
    </element-platform>
    <ui-input name="serial_number" bind="element.serial_number">
      <ui-label>Serial Number</ui-label>
      <ui-note>The serial number of the element</ui-note>
    </ui-input>  
    <ui-input name="mac_address" bind="element.mac_address">
      <ui-label>MAC Address</ui-label>
      <ui-note>The MAC address of the element management-port</ui-note>
    </ui-input>  
  </ui-group>
  <ui-group>
    <ui-label>Management Interfaces</ui-label>
    <ui-note>Configure REST and SSH endpoints of the element.</ui-note>
      <!--  {{#mgmt_interface_list.length}} -->
      <table class="list">
        <thead>
          <tr>
            <th>Name</th>
            <th>Protocol</th>
            <th>Hostname</th>
            <th>Port</th>
            <th>Path</th>
          </tr>
        </thead>
        <tbody>
          <!-- {{#mgmt_interface_list}} -->
            <tr>
              <td><a href="element-mgmt.html?group={{element.group_id}}&element={{element.element_id}}&mgmt_name={{mgmt_name}}" title="Edit management interface properties">{{mgmt_name}}</a></td>
              <td>{{mgmt_protocol}}</td>
              <td>{{mgmt_hostname}}</td>
              <td>{{mgmt_port}}</td>
              <td>{{mgmt_path}}</td></tr>
          <!-- {{/mgmt_interface_list}} -->
        </tbody>
      </table>
      <!-- {{/mgmt_interface_list.length}} -->
      <!-- {{^mgmt_interface_list}} -->
      <ui-blankslate>
        <ui-title>No management interfaces found.</ui-title>
        <ui-note>No management interfaces have been defined for this element.</ui-note>
      </ui-blankslate>
      <!-- {{/mgmt_interface_list}} -->
      <ui-actions>
        <ui-button href="element-mgmt.html?group={{element.group_id}}&element={{element.element_id}}" title="Add new management interface" small>Add</ui-button>
      </ui-actions>
    </ui-group>
  <ui-actions>
    <ui-button name="save-element" primary>Save settings</ui-button>
    <ui-button when="inactive" href="confirm-remove-element.html?group={{element.group_id}}&element={{element.element_id}}" danger>Remove element</ui-button>
  </ui-actions>
</ui-form>
```
All mustache instructions are put into HTML comments to preserve a valid HTML syntax.
This example shows a handy trick to render an array as table.
Every table consists of a table header and a table body and each array item is represented by a table row.
The problem is that the table decleration must not be rendered per array item.
The trick is to declare a block that evaluates the length of an array.
The block is only rendered if the length is greater than 0. 
The block to iterate over the array items is nested in to this block.
The template excerpt below shows the basic layout of nested blocks.
```HTML
<!--  {{#array.length}} -->
<table class="list">
  <thead>
    <!-- Render table header -->
  </thead>
  <tbody>
  <!-- {{#array}} -->
  <tr>
	<!-- Render table row for each array item -->
  </tr>
  <!-- {{/array}} -->
  </tbody>
</table>
<!-- {{/array.length}} -->	
```
 
## Web Component Library

Leitstand provides a set of basic web components to simplify view implementation.

The Leitstand component catalog provides an overview of all existing components including code snippets that can be copied into view templates.
Additional information for each component can be found in the Component Library JSDoc.

The value of a web components is
- HTML encapsulation
- Data Binding and
- Access Control

### HTML Encapsulation
The DOM is fully encapsulated in the component which allows to modify the DOM structure in a single spot.

### Data Binding
Data binding reads the values from the view model and updates the view model accordingly.
The `bind` attribute defines the JSON path to the view model property. 
The `bind` attribute defaults to the value of the `name` attribute if not specified.
The `when` attribute expresses which view model property needs to be present to display a web component.

### Access Control
Access control checks whether the user has the permission to edit a value or perform an action.
A component is set readonly and disabled if the user has insufficient permissions.
The Leitstand login returns all roles of the successfully authenticated user and the web component checks whether the user has one of the roles declared in the `rolesAllowed` attribute of the component.
Multiple roles are separated by a comma.
Roles declared on a form are inherited by form controls if no `rolesAllowed` attribute is set on the form control.
