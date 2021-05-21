import { PlayerTable } from "./player-table"

describe("The game object", function(){
  let newTable = new PlayerTable();
  beforeEach(() => {
    newTable = new PlayerTable();
    newTable.add_player("bunnyt", "123");
    newTable.add_player("rabbit", "134");
    newTable.add_player("horsea", "234");
    newTable.add_player("carrot", "164");
    newTable.add_player("froggy", "174");
    newTable.add_player("deerit", "834");
  });

  it("Adds a player when prompted", async() =>{

    const playerNames: string[] = [];
    newTable.players.forEach(player => {
      playerNames.push(player.name);
    });
    expect(newTable.playerCount).toBe(6);
    expect(playerNames).toStrictEqual(['bunnyt', 'rabbit', 'horsea', 'carrot', 'froggy', 'deerit']);
  });

  it("Prevents a player from being added to a full table", async() =>{
    newTable.add_player("lakers", "224");

    const playerNames: string[] = [];
    newTable.players.forEach(player => {
      playerNames.push(player.name);
    });
    expect(newTable.playerCount).toBe(6);
    expect(playerNames).toStrictEqual(['bunnyt', 'rabbit', 'horsea', 'carrot', 'froggy', 'deerit']);
  });

  it("Removes disconnected players when told to do so", async() =>{
    newTable.players[2].disconnect();
    newTable.players[4].disconnect();
    newTable.remove_disconnected_players();

    const playerNames: string[] = [];
    newTable.players.forEach(player => {
      if (player !== null){
        playerNames.push(player.name);
      }
    });

    expect(playerNames).toStrictEqual( ['bunnyt', 'rabbit', 'carrot', 'deerit']);
    expect(newTable.playerCount).toBe(4);
  });

  it("Removes players at 0 chips when told to do so", async() =>{
    newTable.players[2].stack = 0;
    newTable.players[4].stack = 0;
    newTable.remove_zero_chip_players();

    const playerNames: string[] = [];
    newTable.players.forEach(player => {
      if (player !== null){
        playerNames.push(player.name);
      }
    });

    expect(playerNames).toStrictEqual( ['bunnyt', 'rabbit', 'carrot', 'deerit']);
    expect(newTable.playerCount).toBe(4);
  });

  it("Gets the next player when some seats are empty", async() =>{
    newTable.players[2].stack = 0;
    newTable.disconnect_player("froggy", "174");
    newTable.players[5].stack = 0;
    newTable.remove_disconnected_players();
    newTable.remove_zero_chip_players();

    const playerNames: string[] = [];
    let currIndex = 0;
    for (let i = 0; i < 5; ++i){
      playerNames.push(newTable.players[currIndex].name);
      currIndex = newTable.next_player(currIndex);
    }
    expect(playerNames).toStrictEqual(['bunnyt', 'rabbit', 'carrot', 'bunnyt', 'rabbit']);
  });

  it("Adds new players to fill empty seats left by others", async() =>{
    newTable.players[0].stack = 0;
    newTable.disconnect_player("horsea", "234");

    newTable.remove_disconnected_players();
    newTable.remove_zero_chip_players();

    newTable.add_player("NEW_MAN", "752342");
    newTable.add_player("NEW_DUD", "720992");
    const playerNames: string[] = [];
    newTable.players.forEach(player => {
      if (player !== null){
        playerNames.push(player.name);
      }
    });
    expect(playerNames).toStrictEqual(['NEW_DUD', 'rabbit', 'NEW_MAN', 'carrot', 'froggy', 'deerit']);
  });

  it("Can get us the next actor when some players are folded or all in", async() =>{
    newTable.players[0].disconnect();
    newTable.remove_disconnected_players();

    newTable.players[1].folded = true;
    newTable.players[2].folded = false;
    newTable.players[3].folded = false;
    newTable.players[4].folded = false;
    newTable.players[5].isAllIn = true;

    const playerNames: string[] = [];
    let currIndex = 1;
    for (let i = 0; i < 5; ++i){
      playerNames.push(newTable.players[currIndex].name);
      currIndex = newTable.next_actor(currIndex);
    }
    expect(playerNames).toStrictEqual(['rabbit', 'horsea', 'carrot', 'froggy', 'horsea']);
  });

  it("Returns -1 when there is no one left who can act", async() =>{
    newTable.players[0].disconnect();
    newTable.remove_disconnected_players();

    newTable.players[1].folded = true;
    newTable.players[2].folded = false;
    newTable.players[3].folded = false;
    newTable.players[4].folded = false;
    newTable.players[5].isAllIn = true;

    const playerNames: string[] = [];
    let currIndex = 1;
    for (let i = 0; i < 5; ++i){
      playerNames.push(newTable.players[currIndex].name);
      currIndex = newTable.next_actor(currIndex);
    }
    expect(playerNames).toStrictEqual(['rabbit', 'horsea', 'carrot', 'froggy', 'horsea']);
  });
});
