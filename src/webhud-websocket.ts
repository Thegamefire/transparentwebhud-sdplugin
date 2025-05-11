import streamDeck, { DialAction, KeyAction } from '@elgato/streamdeck';
import WebSocket from 'ws';

export class WebSocketManager {
    private websocketConnection: WebSocket | null = null;
    private responseHandlers: Map<string, (response: any) => void> = new Map();
    private messageCounter: number = 0;

    private connectionPromise: Promise<void> | null = null;

    private dataListeners: Map<KeyAction | DialAction, DataListener> = new Map();

    public async openWebsocket(): Promise<void> {
        this.connectionPromise = new Promise((resolve, reject) => {
            streamDeck.logger.debug("Trying To Open WEBHUD Connection")

            if (this.websocketConnection) {
                this.websocketConnection.close();
            }

            this.websocketConnection = new WebSocket("ws://localhost:8765");

            this.websocketConnection.onopen = () => {
                streamDeck.logger.info("Connected to WEBHUD")
                resolve()
            }
            this.websocketConnection.onerror = (error) => {
                streamDeck.logger.error("WEBHUD Connection Error: " + error.message)
                reject(new Error('Failed to establish WebSocket connection'))
            }
            this.websocketConnection.onclose = () => {
                streamDeck.logger.info("Connection to WEBHUD Closed")
                this.responseHandlers.forEach(handler => {
                    handler(new Error('WebSocket connection closed'));
                });
                this.responseHandlers.clear();
            }

            this.websocketConnection.onmessage = (event) => {
                streamDeck.logger.debug("Received response from WEBHUD: " + event.data)
                if (typeof event.data === "string") {
                    const response = JSON.parse(event.data.substring(11)) // Remove [SD_WEBHUD] from response
                    if (response.requestId && this.responseHandlers.has(response.requestId)) {
                        const handler = this.responseHandlers.get(response.requestId);
                        streamDeck.logger.debug("handler found with data " + response.toString())
                        this.responseHandlers.delete(response.requestId);
                        if (handler) {
                            handler(response?.data)
                        }
                    }
                    for (let key of this.dataListeners.keys()) {
                        if (this.dataListeners.get(key)?.datatype == response.type) {
                            this.dataListeners.get(key)?.handler(response?.data)
                        }
                    }
                }

            }

        })
        return this.connectionPromise;
    }

    public setOnReceiveData(datatype: string, key:KeyAction | DialAction, handler: (response: any) => void): void {
        const dataListener = {
            datatype: datatype,
            handler: handler
        }
        this.dataListeners.set(key, dataListener)
    }

    public removeDataListener(key: KeyAction | DialAction): void {
        this.dataListeners.delete(key)
    }

    public async sendMessage(command: string, args: any) {
        return new Promise(async (resolve, reject) => {
            streamDeck.logger.debug("Trying to send message to WEBUD: "+command)

            if (this.websocketConnection == null || this.websocketConnection.readyState !== WebSocket.OPEN) {
                if (this.websocketConnection?.readyState === WebSocket.CONNECTING) {
                    await this.connectionPromise;
                } else {
                    await this.openWebsocket()
                }
            }

            const requestId = `msg-${Date.now()}-${++this.messageCounter}`
            this.responseHandlers.set(requestId, resolve)

            const timeout = setTimeout(() => {
                this.responseHandlers.delete(requestId);
                reject(new Error("WebSocket response timeout"));
            }, 30000);

            let data = "[SD_WEBHUD]" + JSON.stringify({requestId: requestId, command: command, args: args})
            streamDeck.logger.info("sending data: " + data)
            this.websocketConnection?.send(data, error => {
                if (error != null) {
                    streamDeck.logger.error(error)
                }
            })


        })
    }

    public async closeWebSocket(): Promise<void> {
        if (this.websocketConnection != null) {
            this.websocketConnection.close();
            this.websocketConnection = null;
        }
    }
}

type DataListener = {
    datatype:string,
    handler: (response: any) => void;
}