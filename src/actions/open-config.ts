import streamDeck, {
    action,
    JsonObject,
    KeyDownEvent,
    SendToPluginEvent,
    SingletonAction,
    WillAppearEvent
} from "@elgato/streamdeck";
import {wsManager} from "../plugin";


@action({UUID: "com.thegamefire.overlay-integration.openconfig"})
export class OpenConfig extends SingletonAction<OpenConfigSettings> {

    override async onKeyDown(ev: KeyDownEvent<OpenConfigSettings>): Promise<void> {

        wsManager.sendMessage("open config", {})

    }

}


type OpenConfigSettings = {
};


