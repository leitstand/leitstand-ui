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
 * Provides the logging functionality which can be used by all the client side code.
 * It supports all the severity levels described by the syslog RFC.
 * 
 * @see https://en.wikipedia.org/wiki/Syslog#Severity_level
 */
export default class Logger {
    /**
     * Logs the given information with emergency level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    emerg(msg, extraInfo) {
        this._logMessage("EMERGENCY", msg, extraInfo);
    }

    /**
     * Logs the given information with alert level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    alert(msg, extraInfo) {
        this._logMessage("ALERT", msg, extraInfo);
    }

    /**
     * Logs the given information with critical level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    critical(msg, extraInfo) {
        this._logMessage("CRITICAL", msg, extraInfo);
    }

    /**
     * Logs the given information with error level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    error(msg, extraInfo) {
        this._logMessage("ERROR", msg, extraInfo);
    }

    /**
     * Logs the given information with warning level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    warning(msg, extraInfo) {
        this._logMessage("WARNING", msg, extraInfo);
    }

    /**
     * Logs the given information with notice level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    notice(msg, extraInfo) {
        this._logMessage("NOTICE", msg, extraInfo);
    }

    /**
     * Logs the given information with info level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    info(msg, extraInfo) {
        this._logMessage("INFO", msg, extraInfo);
    }

    /**
     * Logs the given information with debug level.
     *
     * @param {String} msg the message we want to log.
     * @param {Object} extraInfo additional information which must be included in the log message.
     */
    debug(msg, extraInfo) {
        this._logMessage("DEBUG", msg, extraInfo);
    }

    /**
     * Provide a standard way of logging messages with the specified severity level.
     */
    _logMessage(severity, msg, extraInfo) {
        if (!extraInfo) {
            console.log(`${severity.toUpperCase()} ${msg}`);
            return;
        }
        
        console.log(`${severity.toUpperCase()} ${msg} ${JSON.stringify(extraInfoFinal)}`);
    }
}