import { Room, Client, matchMaker } from "colyseus";
import { GameRoom } from "./game-room";

export class MainLobby extends Room {
  onCreate (options: any) {
    this.onMessage("test", (client, message) => {
      console.log(message);
    });

    this.onMessage("public", (client, message) => {
      console.log(message);
      this.broadcast("public", message);
    });

    this.onMessage("find_game", async (client, message) => {
      console.log("someone looking to join a game");
      /*
      await matchMaker.createRoom("game_room", GameRoom);
      this.send(client, "")
      */
    });
  }

  onJoin (client: Client, options: any) {
    console.log("ladies and gentlemen... we got him in the lobby");
    console.log(this.clients.length)
  }

  onLeave (client: Client, consented: boolean) {
  }

  onDispose() {
  }
}
