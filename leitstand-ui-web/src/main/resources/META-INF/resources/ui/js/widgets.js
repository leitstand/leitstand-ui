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
import {Location} from '/ui/js/ui-core.js';
import {Element} from '/ui/js/ui-dom.js';
	 
function Units(){
	var formats = {};

	this.addFormatter=function(unit,formatter){
		formats[unit] = formatter;
		return this;
	}
	
	this.format = function(value,unit){
		var format = formats[unit];
		if(format){
			return format(value,unit);
		}
		return value+" "+unit;
	}
} 

var temperatureFormatter = function(value,unit){
	value = new Number(value);
	return value.toFixed(1)+" "+unit;
}

var percentFormatter = function(value,unit){
	value = new Number(value);
	return value.toFixed(1)+" %";
}

var bpsFormatter = function(value){
	var rate = new Number(value);
	if(rate < 1000){
		return rate.toFixed(3)+" bps";
	}
	if(rate < 1000000){
		return (rate/1000).toFixed(3)+" Kbps";
	}
	if(rate < 1000000000){
		return (rate/1000000).toFixed(3)+" Mbps";
	}
	return (rate/1000000000).toFixed(3)+" Gbps";
}

var gbpsFormatter = function(value){
	var rate = new Number(value);
	return (rate/1000000000).toFixed(3)+" Gbps";
}

var mbpsFormatter = function(value){
	var rate = new Number(value);
	return (rate/1000000).toFixed(3)+" Mbps";
}


var memoryFormatter = function(value){
	var mem = new Number(value);
	if (mem < 1024){
		return mem.toFixex(0)+" kB";
	}
	if(mem < 1024*1024){
		return (mem/1024).toFixed(3)+" MB";
	}
	if(mem < 1024*1024*1024){
		return (mem/(1024*1024)).toFixed(3)+" GB";
	}
	return (mem/(1024*1024*1024)).toFixed(3)+ "TB";
	
}

export const units = new Units();
units.addFormatter("°C",temperatureFormatter);
units.addFormatter("°F",temperatureFormatter);
units.addFormatter("%",percentFormatter);
units.addFormatter("bps",bpsFormatter);
units.addFormatter("kb",memoryFormatter);
units.addFormatter("Gbps",gbpsFormatter);
units.addFormatter("Mbps",mbpsFormatter);
