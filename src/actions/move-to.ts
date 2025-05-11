import streamDeck, {
    action,
    JsonObject,
    KeyDownEvent,
    SendToPluginEvent,
    SingletonAction,
    WillAppearEvent
} from "@elgato/streamdeck";
import {wsManager} from "../plugin";


@action({UUID: "com.thegamefire.overlay-integration.moveto"})
export class MoveTo extends SingletonAction<MoveToSettings> {

    override async onSendToPlugin(ev: SendToPluginEvent<JsonObject, MoveToSettings>): Promise<void> {
        if (ev.payload?.event == "getPageNames") {
            let pageNames: any = await wsManager.sendMessage("get page names", {})
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

    override async onKeyDown(ev: KeyDownEvent<MoveToSettings>): Promise<void> {
        let x = ev.payload.settings.xValue ? ev.payload.settings.xValue : 0
        let y = ev.payload.settings.yValue ? ev.payload.settings.yValue : 0
        wsManager.sendMessage("move to", {
            pageIndex: ev.payload.settings.pageIndex,
            x: Number(x),
            y: Number(y),
        })

    }

}


type MoveToSettings = {
    pageIndex?: number;
    pagename?: string;
    xValue:number;
    yValue:number;
};


