import { Room, Client } from "colyseus";
//import { MyRoomState } from "./schema/MyRoomState";

/**
 * MatchmakingPool
 *
 * Keeps track of all clients looking for a game. Places them into a game as well
 *
 * TODO:
 * Add MMR into the matchmaking process
 * Create a 2 second loop?
 */
export class MatchmakingPool extends Room {
  onCreate (options: any) {
    this.clientList = []

    this.onMessage("test", (client, message) => {
      console.log(message);
    });


    this.onMessage("public", (client, message) => {
      this.broadcast("public", message);
    });

  }

  onJoin (client: Client, options: any) {
    console.log("client joined matchmaking");
    console.log(this.clients.length)
  }

  onLeave (client: Client, consented: boolean) {
  }

  onDispose() {
  }
}
