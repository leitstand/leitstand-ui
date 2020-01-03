In  this document you can find all th relevant details about how leitstand platform rendering engine works.

# Abstract

The leitstand platform acts as a distributed rendering engine for multiple UI components. It supports various integration patterns:

1. Trusted components.
1. Untrusted components.

The components supported by leitstand can be developed using:

1. Native leitstand framework.
1. Web components.

# Technical summary

The diagram below can you also be found as [image](images/rendering.png).

```plantuml
@startuml
actor Operator as operator
participant "Relay agent (browser / mobile)" as relay
participant "Leitstand Server" as ui_facade
participant "OIDC Server" as openid_conn
participant IDP as idp

participant "Leitstand Registry" as ui_registry
note over ui_registry: We can have many registries\nwhich provide leitstand components.

participant "Component server" as component_server

operator -> relay: Access a leitstand app.
relay -> ui_facade: Send HTTP/2 request.

group openid_connect
    alt new session
        ui_facade -> openid_conn: Authorize request with id_token code grants.
        openid_conn -> idp: Authenticate request \n(redirect using relay agent).
        idp -> openid_conn: Authentication proof.
        openid_conn -> openid_conn: Generate id_token.
        openid_conn -> openid_conn: Generate authorization_code token.
        openid_conn -> ui_facade: Send id_token and authorizatio_code.
        ui_facade -> openid_conn: Exchange authorization code \nfor access / refresh tokens.
        openid_conn -> openid_conn: Generate access / refresh tokens.
        openid_conn -> ui_facade: Send access / refresh tokens.
        ui_facade -> ui_facade: Stores the mapping between \nid_token and refresh token on the server side.
        ui_facade -> relay: Redirect to the target page \n(contains id_token and refresh_token as cookies.)
    else valid ui sessions with expired access token
        ui_facade -> ui_facade: Fetches the refresh token.
        ui_facade -> ui_facade: Validates refresh token validity.

        alt refresh token valid
            ui_facade -> openid_conn: Exchage refresh token \nfor new access / refresh tokens.
            openid_conn -> openid_conn: Validates refresh token.
            openid_conn -> openid_conn: Generate new access token.
            openid_conn -> openid_conn: Generate new refresh token.
            openid_conn -> ui_facade: Sends new access / refresh tokens.
            ui_facade -> relay: Set the new  access token cookie.
        else refresh token expired
            ui_facade -> relay: Clears all cookies and \ntriggers new session.
        end
    end
end

group rendering
    group core
        relay -> ui_facade: Request the target page \nusing HTTP/2.
        ui_facade -> ui_facade: Obtains a list of all component providers.

        ui_facade -> ui_registry: Query the provider for \nall available components.
        ui_facade -> ui_facade: Build a unified registry \naggregating all registries.
        ui_facade -> relay: Render the leitstand microkernel.
        relay -> relay: Construct the leitstand security context.
        relay -> relay: Renders the navigation menus and core layouts.
    end

    group component
        relay -> relay: Determine the integration pattern.
        relay -> component_server: Loads the component using\n the integration pattern.
        component_server -> openid_conn: Authorize the request.
        openid_conn -> component_server: Send the authorization response (true / false)
        
        alt request authorized
            component_server -> relay: Sends the component.
            relay -> relay: Renders the component.
        else not authorized
            component_server -> relay: Sends unauthorized response.
            relay -> relay: Renders a failure placeholder.
        end
    end
end
@enduml
```

The following diagram assumes the following requirements are provided by leitstand server:

1. Durable fast storage for managing the tokens.
1. Discovery process for all components registries.
1. Management APIs for controlling the components and required permissions. This is a must in order to avoid deploying the leitstand server every single time we add a new component.
1. Leitstand microkernel capable of maintaining a security context on the client side.
1. Every component loaded can communicate with the leitstand microkernel for:
    1. Accessing the security context.
    1. Retrieving user preferences.
    1. Retrieving user details.
1. Leitstand server provides a clean way to define themes for components, menus and layouts.
1. Leitstand microkernel provides adapters for making it usable from various frameworks:
    1. Leitstand native components.
    1. Polymer webcomponents.
    1. React applications.
    1. AngularJS applications.