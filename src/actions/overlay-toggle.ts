import streamDeck, {
    action,
    DidReceiveSettingsEvent,
    JsonObject,
    KeyDownEvent,
    SendToPluginEvent,
    SingletonAction,
    WillAppearEvent
} from "@elgato/streamdeck";
import { WebSocketManager } from "../webhud-websocket";


@action({UUID: "com.thegamefire.overlay-integration.toggleoverlay"})
export class OverlayToggle extends SingletonAction<ToggleSettings> {

    private wsManager:WebSocketManager

    constructor(wsManager:WebSocketManager) {
        super()
        this.wsManager = wsManager
    }

    override async onSendToPlugin(ev: SendToPluginEvent<JsonObject, ToggleSettings>): Promise<void> {
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

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ToggleSettings>): Promise<void> {
        this.wsManager.removeDataListener(ev.action)
        this.wsManager.setOnReceiveData("page data", ev.action, (responseData)=>this.updateImage(ev, responseData))
        this.updateImage(ev, null);
    }
    override async onWillAppear(ev: WillAppearEvent<ToggleSettings>): Promise<void> {
        this.wsManager.removeDataListener(ev.action);
        this.wsManager.setOnReceiveData("page data", ev.action, (responseData)=>this.updateImage(ev, responseData))
        this.updateImage(ev, null);
    }
    

    override async onKeyDown(ev: KeyDownEvent<ToggleSettings>): Promise<void> {
        this.wsManager.sendMessage("toggle HUD-element", {
            pageIndex: ev.payload.settings.pageIndex
        })
        this.updateImage(ev, null)
    }

    private async updateImage(ev:any, pageData: null | PageData): Promise<void> {
        if (pageData == null) {
            pageData = (await this.wsManager.sendMessage("get page data", {
                pageIndex: ev.payload.settings.pageIndex
            })) as PageData;
        }
        streamDeck.logger.debug("Updating Toggle Image to: "+ "imgs/actions/toggle/window-key-"+(pageData.enabled? "enabled" : "disabled"))
        ev.action.setImage("imgs/actions/toggle/window-key-"+(pageData.enabled? "enabled" : "disabled"))
    }

}


type ToggleSettings = {
    pageIndex?: number;
    pagename?: string;
};


type PageData = {
    pageName: string;
    pageIndex: number;
    url: string;
    location: Array<Number>;
    size: Array<Number>;
    crop: Array<Number>;
    opacity: number;
    windowAttributes: WindowAttrituteData;
    enabled: boolean;
}

type WindowAttrituteData = {
    frameless: boolean;
    alwaysOnTop: boolean;
    transparent: boolean;
    mouseTransparent: boolean;
}