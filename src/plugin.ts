import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { OpenConfig } from "./actions/open-config";
import { OverlayToggle } from "./actions/overlay-toggle";
import { ChangeOpacity } from "./actions/change-opacity";
import { MoveTo } from "./actions/move-to";
import { MoveWith } from "./actions/move-with";
import { Zoom } from "./actions/zoom";
import { WebSocketManager } from "./webhud-websocket";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);


const wsManager = new WebSocketManager

// Register the increment action.
streamDeck.actions.registerAction(new OpenConfig(wsManager));
streamDeck.actions.registerAction(new OverlayToggle(wsManager));
streamDeck.actions.registerAction(new ChangeOpacity(wsManager));
streamDeck.actions.registerAction(new MoveTo(wsManager));
streamDeck.actions.registerAction(new MoveWith(wsManager));
streamDeck.actions.registerAction(new Zoom(wsManager));

// Finally, connect to the Stream Deck.
streamDeck.connect();

