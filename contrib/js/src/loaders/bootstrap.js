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

import WebComponentsLoader from "./webcomponents.js"
import Logger from "../core/logger.js";

const wcLoader = new WebComponentsLoader();
const logger = new Logger();

window.addEventListener("load", () => {
    window.dispatchEvent(new Event("renderersLoaded"));
});

window.addEventListener("renderUIModule", (evt) => {
    const compDescriptor = evt.detail.compDescriptor;
    if (!compDescriptor) {
        logger.error("Given event doesn't contain a valid compDescriptor.", evt);
        return;
    }

    const securityCtx = evt.detail.securityCtx;
    if (!securityCtx) {
        logger.error("Given event doesn't contain a valid securityCtx.", evt);
        return;
    }

    wcLoader.load(compDescriptor, securityCtx).then((compDescriptor) => {
        compDescriptor.render(compDescriptor);
        logger.info(`Component ${compDescriptor.url} rendered successfully.`);
    }, (err) => {
        logger.error(err);
    });
});