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

// Register the increment action.
streamDeck.actions.registerAction(new OpenConfig());
streamDeck.actions.registerAction(new OverlayToggle());
streamDeck.actions.registerAction(new ChangeOpacity());
streamDeck.actions.registerAction(new MoveTo());
streamDeck.actions.registerAction(new MoveWith());
streamDeck.actions.registerAction(new Zoom());

// Finally, connect to the Stream Deck.
streamDeck.connect();

export const wsManager = new WebSocketManager
