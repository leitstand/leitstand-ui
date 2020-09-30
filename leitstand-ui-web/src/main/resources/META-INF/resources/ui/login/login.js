/* 
 * Copyright 2020 RtBrick Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License.  You may obtain a copy
 * of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
import {Resource} from '/ui/js/client.js';
import {Controller} from '/ui/js/ui.js';
import {UserContext,Location} from '/ui/js/ui-core.js';

class User extends Resource {
	login(userName,password){
		return this.json("/api/v1/login/_login")
				   .POST({"user_name":userName,
				          "password":password});
	}
}

class LoginConfiguration extends Resource {
	load(){
		return this.json("/api/v1/login/config")
				   .GET();
	}
	
}

class LoginForm extends HTMLElement {
	
	connectedCallback(){
		let user = new User();
		let config = new LoginConfiguration();
		let form = this;
		config.onLoaded = function(config){
							if(config.oidc_enabled){
								let view = document.referrer;
								if(!view || !view.includes('/ui/views')){
									view = "/ui/welcome";
								}
								view = encodeURIComponent(view);
								let landingPage = `${window.origin}/ui/login/oidc.html${encodeURIComponent(`?view=${view}`)}`;
								let loginScreenUrl = `${config.login_view}?client_id=${config.oidc_client_id}&response_type=code&redirect_uri=${landingPage}&scope=openid`;
								form.innerHTML=`<div class="blankslate">
													<h4>Forwarding you to the central authentication service!</h4>
													<p>It will take only a few seconds. 
													   Please <a href="${escape(loginScreenUrl)}">proceed at the login screen</a> in case you are not automatically redirected.</p>
												</div>`;
								window.location.href=loginScreenUrl;
							}  else {
								form.innerHTML=`<div class="form-group">
													<div class="label">
														<label for="user_id">User ID</label>
													</div>
													<div class="input">
														<input class="form-control" type="text" id="user_name"
															   name="user_name" placeholder="Enter Your User Name" autofocus>
													</div>
												</div>
												<div class="form-group">
													<div class="label">
														<label for="password">Password </label>
													</div>
													<div class="input">
														<input class="form-control" type="password" id="password"
															   name="password" placeholder="Enter Your Password">
													</div>
												</div>
												<button id="login" class="btn btn-primary btn-block">Log in</button>`;
			
								let loginView = new Controller({
													resource: user,
													buttons : {
														"login" : function() {
															let user_id = this.input("user_name").value();
															let password = this.input("password").value();
															user.login(user_id, password);
														}
													},
													onSuccess : function(authenticatedUser){
														UserContext.init(authenticatedUser);
														if(document.referrer){
															let location = new Location(document.referrer);
															let path = location.path;
															if(path && path.startsWith("/ui/views")){
																// Forward the user to the originally requested view.
																this.redirect(path);
																return;
															}
														}
														// Default redirect if no referrer is set or the referrer does not 
														this.redirect("/ui/welcome");
													},
													onUnauthorized: function(){
														// Override default redirect to login page,
														// because we're already on the login page.
													}
								});
								loginView.bind(form);
							}
			};
		config.load();
	}
}
customElements.define("ui-login-form",LoginForm);
