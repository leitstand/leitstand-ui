import {Resource} from '/ui/js/client.js';
import {Controller,UserContext} from '/ui/js/ui.js';
import {Location} from '/ui/js/ui-core.js';

class Member extends Resource {
	login(user_id,password){
		this.json("/api/v1/_login")
			.POST({"user_id":user_id,
				   "password":password});
	}
}

let member =  new Member();
let page = new Controller({
	resource : member,
	buttons : {
		"login" : function() {
			let user_id = this.input("user_id").value();
			let password = this.input("password").value();
			member.login(user_id, password);
		}
	},
	onSuccess : function(settings){
		let roles = {};
		if(settings.roles){
			settings.roles.forEach(function(role){
				roles[role] = true;
			});
		}
		new UserContext(settings);
		this.setAttribute("userid",settings.user_id);
		this.setAttribute("roles",JSON.stringify(roles));
		if(document.referrer){
			let location = new Location(document.referrer);
			let path = location.path();
			if(path && path.startsWith("/ui/views")){
				this.redirect(path);
				return;
			}
		}
		this.redirect("/ui/views/inventory/pods.html");
	},
	onUnauthorized: function(){
		// Override default redirect to login page,
		// because we're already on the login page.
	}
});
page.bind(document);
