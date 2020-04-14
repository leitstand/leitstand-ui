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

import install from 'jasmine-es6';
import ComponentDescriptor from "../../js/src/core/descriptor";
import SecurityContext from "../../js/src/core/security";
import WebComponentsLoader from "../../js/src/loaders/webcomponents";

install();

const WEBCOMPONENT_TPL = `
<html>
    <head>
        <script src="/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
        <script type="module" src="/src/sample-app/sample-app.js"></script>
    </head>

    <body>
        <sample-app></sample-app>
    </body>
</html>
`;

describe("Test the remote webcomponents loader.", function() {
    beforeAll(function() {
        this._previousDomParser = global.DOMParser;
        global.DOMParser = require("xmldom").DOMParser;
    });

    afterAll(function() {
        global.DOMParser = this._previousDomParser;
    });

    beforeEach(function() {
        global.document = jasmine.createSpyObj("document", ["createElement"]);
        global.document.head = jasmine.createSpyObj("head", ["appendChild"]);
        global.document.createElement.and.callFake(() => {
            return {};
        });

        this._renderingMsg = undefined;
        this._httpService = jasmine.createSpyObj("httpService", ["fetch"]);
        this._currentGetCall = 0;
        global.window = {
            location: { href: "http://localhost:8081" },
            customElements: {
                get: () => {
                    if (++this._currentGetCall % 2 !== 0) {
                        return;
                    }

                    return {};
                }
            },
            requestAnimationFrame: (callback) => {
                setTimeout(() => {
                    callback();
                }, 10);
            }
        }

        this._loader = new WebComponentsLoader({
            httpService: this._httpService
        });
        this._compDescriptor = new ComponentDescriptor({
            type: ComponentDescriptor.webComponentType,
            url: new URL("http://localhost:8080"),
            tag: "sample-app"
        });

        this._securityCtx = new SecurityContext({
            accessToken: "test access token",
            idToken: "test id token",
        });
    });

    afterEach(function() {
        delete global.window;
    });

    it("load remote webcomponent works as expected.", function() {
        this._httpService.fetch.and.callFake((url) => {
            expect(url).toBeDefined();
            expect(url.hostname).toBe(this._compDescriptor.url.hostname);
            expect(url.host).toBe(this._compDescriptor.url.host);
            expect(url.protocol).toBe(this._compDescriptor.url.protocol);
            expect(url.path).toBe(this._compDescriptor.url.path);
            expect(url.origin).toBe(this._compDescriptor.url.origin);
            expect(url.searchParams).toBeDefined();
            expect(url.searchParams.get("access_token")).toBe(this._securityCtx.accessToken);

            return new Promise((resolve) => {
                resolve({
                    text: () => Promise.resolve(WEBCOMPONENT_TPL)
                });
            });
        });

        return this._loader.load(this._compDescriptor, this._securityCtx)
            .then((comp) => {
                expect(comp).toBe(this._compDescriptor);
                expect(global.document.createElement).toHaveBeenCalledWith("script");
                expect(global.document.createElement).toHaveBeenCalledTimes(2);
            });
    });

    it("load remote webcomponent when server fails with unexpected error.", function() {
        const err = new Error();
        this._httpService.fetch.and.callFake((url) => {
            return new Promise((resolve, reject) => {
                reject(err);
            })
        });

        this._loader.load(this._compDescriptor, this._securityCtx).catch((caughtErr) => {
            expect(caughtErr).toBe(err);
        });
    });

    it("load remote webcomponent when fetching content from server fails with unexpected error.", function() {
        const err = new Error();
        this._httpService.fetch.and.callFake((url) => {
            return new Promise((resolve) => {
                resolve({
                    text: () => Promise.reject(err)
                });
            })
        });

        this._loader.load(this._compDescriptor, this._securityCtx).catch((caughtErr) => {
            expect(caughtErr).toBe(err);
        });
    });

    it("load remote webcomponent when no component descriptor specified fails.", function() {
        expect(() => this._loader.load(undefined, this._securityCtx))
            .toThrow(new Error("invalid component descriptor"));
    });

    it("load remote webcomponent when no tag is specified fails.", function() {
        delete this._compDescriptor._tag;
        expect(() => this._loader.load(this._compDescriptor, this._securityCtx))
            .toThrow(new Error("invalid component descriptor - no tag specified"));
    });

    it("load remote webcomponent when no url is specified fails.", function() {
        delete this._compDescriptor._url;
        expect(() => this._loader.load(this._compDescriptor, this._securityCtx))
            .toThrow(new Error("invalid component descriptor - no url specified"));
    });

    it("load remote webcomponent when url is not of type URL fails.", function() {
        this._compDescriptor._url = "invalid url";
        expect(() => this._loader.load(this._compDescriptor, this._securityCtx))
            .toThrow(new Error("invalid component descriptor - invalid url specified"));
    });

    it("load remote webcomponent when no security context specified fails.", function() {
        expect(() => this._loader.load(this._compDescriptor, undefined))
            .toThrow(new Error("invalid security context"));
    });

    it("load remote webcomponent when security context doesn't contain an access token.", function() {
        delete this._securityCtx._accessToken;
        expect(() => this._loader.load(this._compDescriptor, this._securityCtx))
            .toThrow(new Error("invalid security context - accessToken is missing."));
    });

    it("load remote webcomponent when security context doesn't contain an id token.", function() {
        delete this._securityCtx._idToken;
        expect(() => this._loader.load(this._compDescriptor, this._securityCtx))
            .toThrow(new Error("invalid security context - idToken is missing."));
    });
});