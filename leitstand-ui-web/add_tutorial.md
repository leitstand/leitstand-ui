# Add New Entity Tutorial

This tutorial is the second of a series of tutorials that explains how to extend the Leitstand UI.
The first tutorial explained how to display a list of entities, using the webhooks list view as an example. This tutorial explains how to add a new webhook.

## Webhooks Resource
The `Webhooks` resource introduced in the first tutorial provides a `addHook` method to add a new webhook.

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

The `addHook` operation expects a webhook settings object. The webhook settings consist of

- the webhook ID
- the webhook name
- an optional webhook description
- a flag indicating whether the webhook is enabled
- the subscribed topic and the event selector
- an optional batch size stating who many invocations are executed in one go. All invocations of the same batch are retried, if a single invocation failed.
- the HTTP request method
- the HTTP endpoint URL
- the secrets to authenticate the webhook invocation.

## View Template
The view template renders a form to configure the new webhook.

```HTML
<ui-view-header>
  <ui-breadcrumbs>
    <ui-breadcrumb href="webhooks.html">Webhooks</ui-breadcrumb>
    <ui-breadcrumb>New Webhook</ui-breadcrumb>
  </ui-breadcrumbs>
  <ui-title>New Webhook</ui-title>
  <ui-subtitle>Add a new webhook</ui-subtitle>
</ui-view-header>
<ui-form rolesAllowed="Administrator">
  <ui-group>
    <ui-label>General Settings</ui-label>
    <ui-note>General informations about the webhook</ui-note>
    <ui-input name="hook_name" bind="hook.hook_name">
      <ui-label>Name</ui-label>
      <ui-note>Unique web hook name</ui-note>
    </ui-input>
    <ui-textarea name="description" bind="hook.description">
      <ui-label>Description</ui-label>
      <ui-note>Brief description of which system is connected via this webhook.</ui-note>
    </ui-textarea>	
  </ui-group>
  <ui-group>
    <ui-label>Subscription</ui-label>
    <ui-note>Configure what messages shall be processed by the web hook.</ui-note>
    <ui-select name="topic_name" options="topics" bind="hook.topic_name">
      <ui-label>Topic</ui-label>
      <ui-note>Select the topic this webhook should subscribe.</ui-note>
    </ui-select>
    <ui-input name="selector" bind="hook.selector">
      <ui-label>Selector</ui-label>
      <ui-note>
        Optional selector formed by a regular expression.
        The event name must match the regular expression to process the event.
      </ui-note>
    </ui-input>
    <ui-select name="batch_size" options="batch_sizes" bind="hook.batch_sizes">
      <ui-label>Batch Size</ui-label>
      <ui-note>
        Maximum number of messages processed in one go.
        All messages of a batch are executed again in case of an error thereby 
        guaranteeing an <em>at-least-once</em> successful message processing.
      </ui-note>
    </ui-select>
  </ui-group>
  <ui-group>
    <ui-label>HTTP Endpoint</ui-label>
    <ui-input name="endpoint" bind="hook.endpoint">
    <ui-label>URL</ui-label>
      <ui-note>The webhook endpoint URL</ui-note>
    </ui-input>
    <ui-select name="method" bind="hook.method" options="http_methods">
      <ui-label>Method</ui-label>
      <ui-note>The HTTP request method</ui-note>
    </ui-select>
    <ui-radio name="auth_mode" value="basic">
      <ui-label>Basic authentication</ui-label>
      <ui-note>
        Provide user name and password credentials to authenticate the web hook invocation.
      </ui-note>
    </ui-radio>
    <ui-radio name="auth_mode" value="bearer">
      <ui-label>Bearer token</ui-label>
      <ui-note>
        Provide an access key, conveyed as bearer token in the HTTP Authorization header, 
        to authenticate the web hook invocation.
      </ui-note>
    </ui-radio>
    <ui-radio name="auth_mode" default>
      <ui-label>Unauthenticated</ui-label>
      <ui-note>Invoke webhook without authentication.</ui-note>
    </ui-radio>
  </ui-group>
  <ui-group when="basic_auth">
    <ui-label>Basic Authentication</ui-label>
    <ui-input name="user_id" bind="hook.user_id">
      <ui-label>User</ui-label>
      <ui-note>Webhook user login ID</ui-note>
    </ui-input>
    <ui-password name="password" bind="hook.password">
      <ui-label>Password</ui-label>
      <ui-note>Password to authenticate the user</ui-note>
    </ui-password>
    <ui-password name="confirm_password" bind="hook.confirm_password">
      <ui-label>Confirm password</ui-label>
      <ui-note>Enter password again in order to detect accidental typos.</ui-note>
    </ui-password>
  </ui-group>
  <ui-group when="bearer_auth">
    <ui-label>Bearer Token</ui-label>
    <ui-textarea name="accesskey" bind="hook.accesskey">
      <ui-label>Access Key</ui-label>
      <ui-note>Access key to authenticate the webhook invocation</ui-note>
    </ui-textarea>
  </ui-group>
  <ui-actions>
    <ui-button name="save-settings" primary>Save webhook</ui-button>
    <ui-button href="webhooks.html">Cancel</ui-button>
  </ui-actions>
</ui-form>
```

The view template uses the Leitstand UI form components and binds all hook attributes to the `hook` object in the view model (e.g. `bind="hook.hook_name"`). 
Also, the view template contains _conditional_ groups to display the authentication settings for the selected authentication mode (e.g. `when="bearer_auth"`). 
The available options for the existing select boxes, in order to select the HTTP method, topic, and batch size, are read from the view model (e.g. `options="http_methods"`) 


## Controller

The controller creates a new Webhooks resource to store a new webhook and prepares the view model consisting of
- an array of supported HTTP request methods
- an array of existing topics and
- an array of supported batch sizes.  
The controller also implements the `save-settings` function to store the new webhook and the `onSuccess` callback to navigate to the webhook list view after the webhook was successfully added.

```ES6

const TOPICS = [{'value':'','label':''},
                {'value':'element','label':'Element'},
                {'value':'image','label':'Image'},
                {'value':'metric', 'label':'Metric'}];

const BATCH_SIZES = [{'value':1, 'label': '1 message'},
                     {'value':2, 'label': '2 messages'},
                     {'value':3, 'label': '3 messages'},
                     {'value':4, 'label': '4 messages'},
                     {'value':5, 'label': '5 messages'},
                     {'value':6, 'label': '6 messages'},
                     {'value':7, 'label': '7 messages'},
                     {'value':8, 'label': '8 messages'},
                     {'value':9, 'label': '9 messages'},
                     {'value':10, 'label': '10 messages','default':true}];

const HTTP_METHODS = [{'value':'PUT'},
                      {'value':'POST', 'default':true}];



let newWebhookController = function(){
  let hooks = new Webhooks();
  return new Controller({
    resource:hooks,
    viewModel:function(){
      let viewModel = {'http_methods':HTTP_METHODS,
       				 'topics':TOPICS,
       				 'batch_sizes':BATCH_SIZES};
      viewModel.basic_auth = function(){
        return this.auth_mode == 'basic';
      };
	
	  viewModel.bearer_auth = function(){
	    return this.auth_mode == 'bearer';
	  };
	  
	  return viewModel;
	},
	buttons:{
	  'save-settings':function(){
	    let settings = this.getViewModel('hook');
	    let authmode = this.getViewModel('auth_mode');
	    if(authmode != 'basic'){
	      delete settings.user_id;
	      delete settings.password;
	      delete settings.cofirm_password;
	    } 
	    if (authmode != 'bearer'){
	      delete settings.accesskey;
	    }
	    hooks.addHook(settings);
	  }
	},
	onSuccess:function(){
	  this.navigate('webhooks.html');
	}
  });
}	
```

The controller registration for the add-webhook view was already discussed in the webhook list view tutorial. Remember that the list view was declared as master detail view with the add-webhook view as detail view:

```ES6
let webhooksView = {
  'master':webhooksController(),
  'details':{'new-webhook.html':newWebhookController()}
};
```

The next tutorial discusses how to manage an existing webhook.							  