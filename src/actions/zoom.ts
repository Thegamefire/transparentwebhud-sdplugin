import streamDeck, { action, DidReceiveSettingsEvent, JsonObject, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { WebSocketManager } from "../webhud-websocket";




@action({UUID: "com.thegamefire.overlay-integration.zoom"})
export class Zoom extends SingletonAction<ZoomSettings> {


    private wsManager:WebSocketManager

    constructor(wsManager:WebSocketManager) {
        super()
        this.wsManager = wsManager
    }

    override async onSendToPlugin(ev: SendToPluginEvent<JsonObject, ZoomSettings>): Promise<void> {
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

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ZoomSettings>): Promise<void> {
        this.updateImage(ev);
    }
    override async onWillAppear(ev: WillAppearEvent<ZoomSettings>): Promise<void> {
        this.updateImage(ev);
    }
    

    override async onKeyDown(ev: KeyDownEvent<ZoomSettings>): Promise<void> {
        this.wsManager.sendMessage("resize window", {
            pageIndex: ev.payload.settings.pageIndex,
            widthDiff: Number(ev.payload.settings.zoomFactor),
            heightDiff: Number(ev.payload.settings.zoomFactor)
        })
        this.updateImage(ev)
    }

    private async updateImage(ev:any): Promise<void> {
        ev.action.setImage("imgs/actions/zoom/zoom-"+(Number(ev.payload.settings.zoomFactor)>=0? "plus" : "minus"));
    }
}


type ZoomSettings = {
    pageIndex?: number;
    pagename?: string;
    zoomFactor?: number;
};