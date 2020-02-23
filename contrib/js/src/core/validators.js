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

/**
 * Validators class provides a useful set of utility methods used for validating various entities.
 */
export class Validators {
    /**
     * Throws an error in case the given object is null or undefined.
     * @param {Object} obj the object we want to validate.
     * @param {String} errMsg the error message we want to raise.
     */
    static throwIfNotDefined(obj, errMsg) {
        if (!obj) {
            throw new Error(errMsg);
        }
    }

    /**
     * Throws an error in case the given object is not of type URL.
     * @param {Object} obj the potential url object.
     * @param {String} errMsg the error message which we want to throw in case of a failed assert.
     */
    static throwIfNotUrl(obj, errMsg) {
        if (!(obj instanceof URL)) {
            throw new Error(errMsg);
        }
    }
}