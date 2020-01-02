# Leitstand UI Services

_Leitstand UI Services_ discovers the existing [UI modules](../leitstand-ui-web/doc/module.md) and provides access to the main menu and module descriptors.

A `GET /ui/modules` request loads the main menu descriptor. A `GET /ui/modules/{module}` loads the module descriptor for the module specified in `{module}`. More details can be found in the [API specification](./assets/openapi/modules.yaml).