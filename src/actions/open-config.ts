import streamDeck, {
    action,
    JsonObject,
    KeyDownEvent,
    SendToPluginEvent,
    SingletonAction,
    WillAppearEvent
} from "@elgato/streamdeck";
import { WebSocketManager } from "../webhud-websocket";


@action({UUID: "com.thegamefire.overlay-integration.openconfig"})
export class OpenConfig extends SingletonAction<OpenConfigSettings> {


    private wsManager:WebSocketManager

    constructor(wsManager:WebSocketManager) {
        super()
        this.wsManager = wsManager
    }

    override async onKeyDown(ev: KeyDownEvent<OpenConfigSettings>): Promise<void> {

        this.wsManager.sendMessage("open config", {})

    }

}


type OpenConfigSettings = {
};


