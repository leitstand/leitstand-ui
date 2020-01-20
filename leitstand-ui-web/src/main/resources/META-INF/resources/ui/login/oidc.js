import {Resource} from '/ui/js/client.js';
import {Controller} from '/ui/js/ui.js';
import {Location, UserContext} from '/ui/js/ui-core.js';

class OidcAuthenticationFlow extends Resource {
	login(code,view){
		return this.json('/api/v1/login/oidc/_authentication_flow?code={{code}}&redirect_uri={{view}}',{"code":code,"view":view})
				   .POST();
	}
}

class OidcAuthenticationFlowController extends Controller {
	
	constructor(){
		super({resource:new OidcAuthenticationFlow(),
			   onSuccess:function(user){
				   UserContext.init(user);
				   this.redirect(decodeURIComponent(this.location().param('view')));
			   },
			   onUnauthorized:function(){
				   this.redirect("/ui/login/login.html");
			   }
		});
	}
	
	login(){
		let redirectUri = `${window.origin}${window.location.pathname}`;
		if(this.location().param('view')){
			redirectUri+=`?view=${encodeURIComponent(this.location().param('view'))}`;
		}
		this._page.resource.login(this.location().param('code'), 
		 			  			 encodeURIComponent(redirectUri));
	}
	
}

class OidcSession extends HTMLElement {
	
	connectedCallback(){
		this.innerHTML='<ui-blankslate><ui-title>Please wait until your session is established.</ui-title><ui-note>It will take only a few seconds.</ui-note></ui-blankslate>'
		let controller = new OidcAuthenticationFlowController();
		controller.login();
	}
}

customElements.define('oidc-session',OidcSession)