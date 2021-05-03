import { Room, Client} from "colyseus";
import { Deck } from "@game/deck";

export class GameRoom extends Room {
  deck: Deck = new Deck();

  onCreate (options: any) {
    this.onMessage("test", (client, message) => {
      console.log(message);
    });
  }

  onJoin (client: Client, options: any) {
    console.log("yoooo they in the games room now let's go!");
    console.log(this.clients.length);
  }

  onLeave (client: Client, consented: boolean) {
    console.log("fake news");
  }

  onDispose() {
    console.log("dispose fake news");
  }
}
