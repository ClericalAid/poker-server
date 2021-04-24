import { Room, Client } from "colyseus";

export class MainLobby extends Room {

  onCreate (options: any) {
    this.onMessage("test", (client, message) => {
      console.log(message);
    });


    this.onMessage("public", (client, message) => {
      this.broadcast("public", message);
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
