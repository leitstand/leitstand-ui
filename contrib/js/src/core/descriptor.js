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
 * Provides a model for standardising the description of a component currently registered with the running
 * leitstand platform.
 */
export default class ComponentDescriptor {
    /**
     * Instantiates the descriptor with all the mandatory attributes.
     * @param {Object} opts the options supported by the descriptor.
     * @param {URL} opts.url the url of the component.
     * @param {String} opts.type the type of the component currently described.
     * @param {String} opts.tag the custom element tag currently provided by the component.
     * @param {Function} opts.render allows injection of a custom renderer. The function accepts
     *  only the component descriptor as argument.
     */
    constructor(opts) {
        this._url = opts.url;
        this._type = opts.type;
        this._tag = opts.tag;
        this._render = opts.render || function(compDescriptor) {
            const element = document.createElement(compDescriptor.tag)
            const displayArea = document.getElementById("displayArea");
            displayArea.innerHTML = "";
            displayArea.appendChild(element);
        };
    }

    /**
     * Returns the native commponent type identifier.
     */
    static get nativeType() {
        return "native";
    }

    /**
     * Returns the web component type identifier.
     */
    static get webComponentType() {
        return "webcomponent";
    }

    /**
     * Returns the web component url which can be used to retrieve the code of the web component.
     * We are going to append the access token to this url in order to standardise the authorisation proof
     * transmission.
     */
    get url() {
        return this._url;
    }

    /**
     * Returns the type of the component described. For the moment we support:
     * - native (leitstand components)
     * - webcomponent
     */
    get componentType() {
        return this._type;
    }

    /**
     * Returns the web component tag we are currently expect to render.
     */
    get tag() {
        return this._tag;
    }

    /**
     * Returns the current renderer for this component.
     */
    get render() {
        return this._render;
    }

    /**
     * Validates the given component descriptor.
     * @param {ComponentDescriptor} compDescriptor the component descriptor we want to validate.
     */
    static validate(compDescriptor) {
        Validators.throwIfNotDefined(compDescriptor, "invalid component descriptor");
        Validators.throwIfNotDefined(compDescriptor.tag, "invalid component descriptor - no tag specified");
        Validators.throwIfNotDefined(compDescriptor.url, "invalid component descriptor - no url specified");
        Validators.throwIfNotUrl(compDescriptor.url, "invalid component descriptor - invalid url specified");
    }
}