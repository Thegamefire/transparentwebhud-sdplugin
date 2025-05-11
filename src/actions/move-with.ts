import streamDeck, {
    action,
    DidReceiveSettingsEvent,
    JsonObject,
    KeyDownEvent,
    SendToPluginEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { WebSocketManager } from "../webhud-websocket";


@action({UUID: "com.thegamefire.overlay-integration.movewith"})
export class MoveWith extends SingletonAction<MoveWithSettings> {


    private wsManager:WebSocketManager

    constructor(wsManager:WebSocketManager) {
        super()
        this.wsManager = wsManager
    }

    override async onSendToPlugin(ev: SendToPluginEvent<JsonObject, MoveWithSettings
    >): Promise<void> {
        if (ev.payload?.event == "getPageNames") {
            let pageNames: any = await this.wsManager.sendMessage("get page names", {})
            pageNames = pageNames ? pageNames : [];
            let itemList = []

            for (let i = 0; i < pageNames.length; i++) {
                itemList.push({
                    label: pageNames[i],
                    value: i
                })
            }

            streamDeck.ui.current?.sendToPropertyInspector({
                event: "getPageNames",
                items: itemList
            })
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MoveWithSettings>): Promise<void> {
        this.updateIcon(ev)
    }
    override onWillAppear(ev: WillAppearEvent<MoveWithSettings>): Promise<void> | void {
        this.updateIcon(ev)
    }

    override async onKeyDown(ev: KeyDownEvent<MoveWithSettings
    >): Promise<void> {
        let xDiff=0;
        let yDiff=0;
        let distance = Number(ev.payload.settings.factor)
        switch (ev.payload.settings.direction) {
            case "up": {
                yDiff = -distance;
                break;
            }
            case "down": {
                yDiff = distance;
                break;
            }
            case "left": {
                xDiff = -distance;
                break;
            }
            case "right": {
                xDiff = distance;
                break;
            }
        }
        this.wsManager.sendMessage("move", {
            pageIndex: ev.payload.settings.pageIndex,
            xDiff: xDiff,
            yDiff: yDiff,
        })
        this.updateIcon(ev)
    }

    private async updateIcon(ev: any): Promise<void> {
        ev.action.setImage("imgs/actions/move/move-"+ev.payload.settings.direction
        )
        streamDeck.logger.debug("Set image to "+"imgs/actions/move/move-"+ev.payload.settings.direction)
    }

}


type MoveWithSettings = {
    pageIndex?: number;
    pagename?: string;
    direction: string;
    factor: number;
};


