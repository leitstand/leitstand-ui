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
/**
 * The <code>net.rtbrick.rbms.ui.model</code> package contains all entities to describe a UI module and the UI main menu.
 * The {@link MainMenuService} loads the EMS {@link MainMenu}
 * <p>
 * The EMS UI is a modularized single page application that fully operates on top of the EMS REST API.
 * The {@link ModuleDescriptorService} loads a {@link ModuleDescriptor} from its corresponding YAML file.
 * </p>
 * <p>
 * The EMS REST API is formed by the entirety of all APIs of all EMS modules and applications. 
 * The EMS REST API is therefore subject of changes by means of adding, updating or removing 
 * applications or modules.  Every EMS module and EMS application can contribute UI components.
 * Consequently, the EMS UI consists of modules and applications too.
 * </p>
 */
package io.leitstand.ui.model;
