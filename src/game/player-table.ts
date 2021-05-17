import { Player } from "./player";

/**
 * PlayerTable
 * Manages players in the game and empty seats
 */

const SIX_MAX = 6;

export class PlayerTable{
  tableSize = 6;

  // Table state
  players: Player[];
  playerCount = 0;
  nextEmptySeat = 0;

  constructor(tableSize = SIX_MAX){
    // Game state
    this.tableSize = tableSize;
    this.players = new Array(this.tableSize);
    this.players.fill(null);
  }

  /**
   * update_next_empty_seat
   *
   * Updates the value of this.nextEmptySeat so that it points at an empty seat
   */
  update_next_empty_seat(){
    if (this.playerCount === this.tableSize || this.players[this.nextEmptySeat] === null){
      return;
    }
    for (var i = 0; i < this.tableSize; i++){
      this.nextEmptySeat += 1;
      this.nextEmptySeat = this.nextEmptySeat % this.tableSize;
      if (this.players[this.nextEmptySeat] === null){
        break;
      }
    }
  }

  add_player(userName: string, uuid: string){
    if (this.playerCount === this.tableSize){
      //console.log("THROW ERROR? This operation should be blocked somewhere");
      return;
    }
    var addPlayer = new Player(userName, uuid);
    this.players[this.nextEmptySeat] = addPlayer;
    this.update_next_empty_seat();
    this.playerCount += 1;
  }

  /**
   * remove_disconnected_players
   * input:
   *    player
   * Removes the player from the game
   */
  remove_disconnected_players(){
    let index = this.next_player(-1);
    for (let i = 0; i < this.tableSize; ++i){
      if (this.players[index].disconnected === true){
        this.players[index] = null;
        this.playerCount -= 1;
      }
      index = this.next_player(index);
    }
    this.update_next_empty_seat();
  }

  /**
   * remove_zero_chip_players
   */
  remove_zero_chip_players(){
    let index = this.next_player(-1);
    for (let i = 0; i < this.tableSize; ++i){
      if (this.players[index].stack === 0){
        this.players[index] = null;
        this.playerCount -= 1;
      }
      index = this.next_player(index);
    }
    this.update_next_empty_seat();
  }

  /**
   * disconnect_player
   * input:
   *    user - 
   * Marks a player as disconnected (they now auto-fold / check)
   *
   * Special cases:
   * 1) Hand is done/ inactive
   *    We can remove the player immediately
   */
  disconnect_player(userName: string, uuid: string){
    this.players.forEach(player => {
      if (player.name === userName && player.uuid === uuid){
        player.disconnect();
      }
    });
  }

  /**
   * cyclic_increment
   *
   * Increments a number but restarts it at 0 when a certain limit has been reached.
   */
  cyclic_increment(incrementNumber: number, maxNumber: number){
    incrementNumber += 1;
    incrementNumber = incrementNumber % maxNumber;
    return incrementNumber;
  }

  /**
   * next_player
   * Cycles through and gets us the next player, ignores "null" players
   */
  next_player(playerIndex: number){
    do {
      playerIndex = this.cyclic_increment(playerIndex, this.tableSize);
    }while(this.players[playerIndex] === null)

    return playerIndex;
  }

  /**
   * next_actor
   * Gets us the next player who has yet to take their turn. If nobody can act, we return -1
   */
  next_actor(actorIndex: number){
    let loopCount = 0;
    do {
      actorIndex = this.next_player(actorIndex);
      loopCount += 1;
      if (loopCount > this.playerCount){
        return -1;
      }
    }while(this.players[actorIndex].isAllIn || this.players[actorIndex].folded)

    return actorIndex;
  }
}
