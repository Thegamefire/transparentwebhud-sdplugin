import streamDeck, {
    action,
    DidReceiveSettingsEvent,
    JsonObject,
    KeyDownEvent,
    SendToPluginEvent,
    SingletonAction,
    WillAppearEvent
} from "@elgato/streamdeck";
import {wsManager} from "../plugin";


@action({UUID: "com.thegamefire.overlay-integration.changeopacity"})
export class ChangeOpacity extends SingletonAction<OpacitySettings> {

    override async onSendToPlugin(ev: SendToPluginEvent<JsonObject, OpacitySettings>): Promise<void> {
        streamDeck.logger.debug("plugin received event")
        if (ev.payload?.event == "getPageNames") {
            let pageNames: any = await wsManager.sendMessage("get page names", {})
            pageNames = pageNames ? pageNames : [];
            streamDeck.logger.debug("received pages: " + pageNames.toString())
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
            streamDeck.logger.debug("Sent to PI")
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<OpacitySettings>): Promise<void> {
        wsManager.removeDataListener(ev.action)
        wsManager.setOnReceiveData("page data", ev.action, (responseData)=>this.updateImage(ev, responseData))
        this.updateImage(ev, null);
    }
    override async onWillAppear(ev: WillAppearEvent<OpacitySettings>): Promise<void> {
        wsManager.removeDataListener(ev.action);
        wsManager.setOnReceiveData("page data", ev.action, (responseData)=>this.updateImage(ev, responseData))
        this.updateImage(ev, null);
    }

    override async onKeyDown(ev: KeyDownEvent<OpacitySettings>): Promise<void> {

        let opacityDiff = ev.payload.settings.opacityDiff?ev.payload.settings.opacityDiff/100:0 ;

        const args = {
            pageIndex: ev.payload.settings.pageIndex,
            opacityDiff: opacityDiff
        }

        wsManager.sendMessage("change opacity", args)
        this.updateImage(ev, null);
    }

    private async updateImage(ev:any, pageData: null | PageData): Promise<void> {
        if (ev.payload.settings.isSliderButton) {
            if (pageData == null) {
                pageData = (await wsManager.sendMessage("get page data", {
                    pageIndex: ev.payload.settings.pageIndex
                })) as PageData;
            }
            const opacity = pageData.opacity;

            streamDeck.logger.debug("opacity = "+opacity)

            const thumbY = 50+(290)*(1-opacity);
            const viewBoxStart = ev.payload.settings.opacityDiff<0?200:0

            const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${viewBoxStart} 200 200">
                <defs>
                    <linearGradient id="background-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ca4b19" />
                    <stop offset="100%" stop-color="#fcce03" />
                    </linearGradient>
                    <mask id="thumb-mask">
                        <rect width="200" height="400" fill="#fff" />
                        <circle id="thumb" cx="100" cy="${thumbY}" r="40" fill="#000" stroke-width="6" />
                    </mask>

                </defs>
                <rect width="200" height="200" fill="url(#background-gradient)"/>
                <rect y="200" width="200" height="200" fill="url(#background-gradient)"/>

                <rect mask="url(#thumb-mask)" x="75" y="25" height="350" width="50" rx="25" fill="none" stroke="#fff" stroke-width="8"/>
                <circle id="thumb" cx="100" cy="${thumbY}" r="40" fill="none" stroke="#fff" stroke-width="13" />

                <rect mask="url(#thumb-mask)" x="75" y="${thumbY}" height="${375-thumbY}" width="50" rx="25" fill="#fff" stroke="none"/>
            </svg>`;
            ev.action.setImage('data:image/svg+xml;charset=utf8,' + encodeURIComponent(image))

        } else {
            ev.action.setImage("imgs/actions/opacity/opacity-key")
        }
    }

}



type OpacitySettings = {
    pageIndex?: number;
    pagename?: string;
    isSliderButton?: boolean;
    opacityDiff?: number;
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