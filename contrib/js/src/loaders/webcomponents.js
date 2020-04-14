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

import ComponentDescriptor from "../core/descriptor.js";
import Logger from "../core/logger.js";
import SecurityContext from "../core/security.js";

/**
 * The web components loader provides the logic for loading remote components.
 */
export default class WebComponentsLoader {
    /**
     * Instantiates and sets the properties of the loader.
     * @param {Object} opts allows custom injection of dependencies into the loader.
     * @param {Object} opts.httpService an object containing a fetch compatible method. See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API.
     */
    constructor(opts) {
        this._logger = new Logger();
        this._httpService = (opts && opts.httpService) ? opts.httpService : {
            fetch: (url) => fetch(url)
        };
    }

    /**
     * Loads the component currently described by the given descriptor.
     * @param {ComponentDescriptor} compDescriptor the descriptor used for locating th component. This must be provided by Leitstand.
     * @returns {Promise} a promise which resolves only when the webcomponent is rendered.
     */
    load(compDescriptor, securityCtx) {
        ComponentDescriptor.validate(compDescriptor);
        SecurityContext.validate(securityCtx);

        this._logger.info(`[START] Loading component ${compDescriptor.url}.`);

        return new Promise((resolve, reject) => {
            const url = new URL(compDescriptor.url);
            url.searchParams.set("access_token", securityCtx.accessToken);
            
            this._httpService.fetch(url)
                .then((resp) => resp.text()
                        .then((body) => {
                            const doc = this._parseDocument(compDescriptor, body);
                            doc.scripts.forEach((script) => this._addScript(script, document.head));

                            return new Promise((loaderResolve, loaderReject) =>
                                this._finaliseLoading(compDescriptor, loaderResolve, loaderReject));
                        })
                        .then(() => {
                            resolve(compDescriptor);
                        })
                        .catch((err) => {
                            reject(err);
                        }),
                    (err) => reject(err));
        });
    }

    /**
     * Extracts all the scripts and css available in the given document and
     * returns them as part of document descriptor.
     * 
     * @param {ComponentDescriptor} compDescriptor the component descriptor we are currently rendering.
     * @param {Object} body the html content we want to parse.
     * @returns {Object} an object containing all css and javascript code.
     */
    _parseDocument(compDescriptor, body) {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(body, "text/html");
        const scripts = dom.getElementsByTagName("script");

        for (let idx = 0; idx < scripts.length; idx++) {
            const script = scripts[idx];
            let scriptSrc = script.attributes.getNamedItem("src").value;
            if (!scriptSrc.startsWith("http:") && !scriptSrc.startsWith("https:") &&
                !scriptSrc.startsWith("//")) {
                scriptSrc = `${compDescriptor.url.protocol}//${compDescriptor.url.host}/${scriptSrc}`
            }

            script.attributes.getNamedItem("src").value = scriptSrc;
        }

        return {
            "scripts":  Array.prototype.slice.call(scripts),
        }
    }

    /**
     * Waits for the tag stored in the component descriptor to become available.
     *
     * @param {ComponentDescriptor} compDescriptor the component descriptor we currently rendered.
     * @param {Function} resolve the resolver of the current render request.
     * @param {Function} reject the reject of the current render request.
     */
    _finaliseLoading(compDescriptor, resolve, reject) {
        if (window.customElements.get(compDescriptor.tag)) {
            this._logger.info(`[FINISH] Loading component ${compDescriptor.url}.`);
            resolve(compDescriptor);
            return;
        }

        window.requestAnimationFrame(() => this._finaliseLoading(compDescriptor, resolve, reject));
    }

    /**
     * Adds a foreign dom script tag in the current dom.
     */
    _addScript(script, target) {
        const newScript = document.createElement("script");
        newScript.src = script.src;
        newScript.type = script.type;
        target.appendChild(newScript);
    }
}