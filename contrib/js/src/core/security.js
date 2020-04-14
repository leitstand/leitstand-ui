// Copyright 2020 Leitstand Authors
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Validators} from "./validators.js";

/**
 * Provides the service for describing the current security context. This is the essential part
 * used by all other components in order to get access to common concerns:
 * 
 * - user preferences
 * - OIDC tokens
 */
export default class SecurityContext {
    /**
     * Initializes the security context with all immutable attributes.
     * @param {Object} opts the options used to initialize the context.
     * @param {String} opts.accessToken the access token.
     * @param {String} opts.idToken the identity token.
     */
    constructor(opts) {
        this._accessToken = opts.accessToken;
        this._idToken = opts.idToken;
    }

    get accessToken() {
        return this._accessToken;
    }

    get idToken() {
        return this._idToken;
    }

    /**
     * Provides the logic for validating the given security context. In case of an failed assert an exception is raised.
     * @param {SecurityContext} securityCtx the security context we want to validate.
     */
    static validate(securityCtx) {
        Validators.throwIfNotDefined(securityCtx, "invalid security context");
        Validators.throwIfNotDefined(securityCtx.accessToken, "invalid security context - accessToken is missing.");
        Validators.throwIfNotDefined(securityCtx.idToken, "invalid security context - idToken is missing.");
    }
}