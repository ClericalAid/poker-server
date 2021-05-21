import { Player } from "./player";

/**
 * Pot
 *
 * sidePots:
 *
 * The size of the side pot which we are adding. The size is defined as how much
 * the player went all in. It is not the total amount of chips in said side pot. For example,
 * if the player went all in for 50 chips, a side pot is set up and the potSize variable
 * is set at 50.
 */
export class Pot {
  sidePots: number[] = [];
  sidePotTotals: number[] = [];
  sidePotParticipants: Player[][];

  reset_pot(){
    this.sidePots = [];
    this.sidePotTotals = [];
    this.sidePotParticipants = [];
  }

  /**
   * add_side_pot
   * parameters
   *
   * The sidePots array is always sorted from smallest side pot to largest. The side pots are 
   * also inserted based on this knowledge.
   *
   * Insert it, then call a sort function. It's always O(nlogn). It's nlogn vs n + logn. Less
   * errors this way.
   */
  add_side_pot(potSize: number){
    this.sidePots.push(potSize);
    this.sidePots.sort((a, b) => a - b);
  }

  /**
   * fill_side_pots
   * Take everybody's chips and put them into the side pots
   *
   * A non-trivial example is as follows:
   * Player A - all in for 50
   * Player B - all in for 100
   * Player C - calls (100 chips)
   * Total chips invested: 250
   *
   * There are two side pots. One side pot requires players to invest 50 chips, the other
   * side pot requires players to invest 100 chips.
   *
   * The total amount of chips in the 50 side pot is 150. (50 * 3 = 150)
   *
   * The total amount of chips in the 100 side pot is 100  ((100 - 50) * 2 = 100)
   *
   * The players who are involved in the 100 sidepot have already invested 50 into the previous
   * side pot. Therefore, the amount which a user invests into a sidepot is:
   *
   *          currentSidePotValue - prevSidePotValue
   *
   * 1) For each player on the table:
   *  2) Loop through each sidepot
   *    a) The player has the chips to put into the sidepot
   *      Put them into the sidepot
   *    b) The player does not have the chips required to "fill" the sidepot
   *      The rest of their chips go into this sidepot, they do not contribute to any further
   *      sidepots.
   */
  fill_side_pots(players: Player[]){
    this.sidePotTotals = new Array(this.sidePots.length);
    this.sidePotTotals.fill(0);

    // 1)
    for (const actor of players){
      if (actor !== null){
        let prevSidePot = 0;
        let playerInvestment = actor.totalInvestment;

        // 2)
        for (var i = 0; i < this.sidePots.length; i++){
          var sidePotAmount = this.sidePots[i];
          var costOfSidePot = sidePotAmount - prevSidePot;

          // 2a)
          if (playerInvestment > costOfSidePot){
            playerInvestment -= costOfSidePot;
            this.sidePotTotals[i] += costOfSidePot;
            prevSidePot = sidePotAmount;
          }

          // 2b)
          else{
            this.sidePotTotals[i] += playerInvestment;
            break;
          }
        }
      }
    }
  }

  /**
   * evaluate_side_pots
   *
   * For each player in the sorted playerRanking:
   *  Place them into their sidepots in which they are competing
   *  Player rankings are sorted, therefore sidepot players are sorted too
   */
  evaluate_side_pots(playerRanking: Player[]){
    this.sidePotParticipants = new Array(this.sidePots.length);
    for (var i = 0; i < this.sidePotParticipants.length; i++){
      this.sidePotParticipants[i] = new Array();
    }

    for (const actor of playerRanking){
      for (var i = 0; i < this.sidePots.length; i++){
        if (actor.totalInvestment >= this.sidePots[i]){
          this.sidePotParticipants[i].push(actor);
        }
      }
    }
  }

  /**
   * distribute_side_pots
   */
  distribute_side_pots(){
    for (var i = 0; i < this.sidePots.length; i++){
      this.distribute_pot(this.sidePotTotals[i], this.sidePotParticipants[i]);
    }
  }

  /**
   * distribute_pot
   * parameters
   *  potAmount - The amount of chips in said pot (could be a side pot)
   *  sortedParticipants - The participants in said pot, sorted by strongest hand to weakest
   *
   * returns:
   * The remainder of chips leftover
   *
   * Distributes the pot amongst the winners, to 2 decimal places
   *
   */
  distribute_pot(potAmount: number, sortedParticipants: Player[]){
    let winnerCount = this.count_winners(sortedParticipants);
    let individualWinnings = potAmount / winnerCount;
    individualWinnings = parseInt(String(individualWinnings*100)) / 100;

    for (var i = 0; i < winnerCount; i++){
      sortedParticipants[i].win_chips(individualWinnings);
      potAmount -= individualWinnings;
      potAmount = Number(potAmount.toFixed(2));
    }

    let winningParticipant = 0;
    while (potAmount > 0){
      sortedParticipants[winningParticipant].win_chips(0.01);
      potAmount -= 0.01;
      potAmount = Number(potAmount.toFixed(2));
      this.cyclic_increment(winningParticipant, winnerCount);
    }

    return;
  }

  cyclic_increment(currNum: number, upperBound: number){
    currNum += 1;
    currNum = currNum % upperBound;
    return currNum;
  }

  /**
   * count_winners
   * It tells us how many winners there are in the given player array. This is because ties can
   * occur, in which case, there are multiple winners splitting the pot.
   */
  count_winners(players: Player[]){
    for (var i = 1; i < players.length; i++){
      if (!this.players_tied(players[i], players[0])){
        break;
      }
    }
    return i;
  }

  /**
   * players_tied
   * Checks if the two given players are tied in terms of hand strength. 
   */
  players_tied(playerA: Player, playerB: Player){
    var handScoreA = playerA.handRanker.handScore;
    var handScoreB = playerB.handRanker.handScore;
    var iterations = Math.min(handScoreA.length, handScoreB.length);
    for (var i = 0; i < iterations; i++){
      if (handScoreA[i] !== handScoreB[i]){
        return false;
      }
    }
    return true;
  }

  /**
   * player_hand_comparer
   * Sort from strongest to weakest.
   *
   * The handscore works such that the first number which is larger means the hand is stronger.
   * I.e.
   * 6, 2, 3 > 5, 11, 9
   */
  player_hand_comparer = (playerA: Player, playerB: Player) => {
    var handScoreA = playerA.handRanker.handScore;
    var handScoreB = playerB.handRanker.handScore;
    var iterations = Math.min(handScoreA.length, handScoreB.length);
    for (var i = 0; i < iterations; i++){
      if (handScoreA[i] !== handScoreB[i]){
        return handScoreB[i] - handScoreA[i];
      }
    }
  }

  /**
   * Payout all players
   * 1) Get all players who did not fold, rank their hands, give them their share of whatever
   * pot they are entitled to
   *
   * 2) Create sidepots out of all active players (only happens if the players did not invest
   * the same amount of money)
   */
  payout_all_pots(allPlayers: Player[], dealer = 0){
    const playerRanking: Player[] = [];
    const sidePots = new Set<number>();

    // rotate player array so that small blind is first, dealer is last
    allPlayers = allPlayers.concat();
    let rotatedPlayers: Player[] = []
    debugger;
    if (dealer !== allPlayers.length - 1){
      rotatedPlayers = allPlayers.slice(dealer + 1).concat(allPlayers.slice(0, dealer + 1));
    }
    rotatedPlayers.forEach((player) => {
      if (player !== null && !player.folded){
        player.handRanker.score_hand();
        playerRanking.push(player);
        sidePots.add(player.totalInvestment);
      }
    });

    sidePots.forEach(sidePot => {
      this.add_side_pot(sidePot);
    });

    playerRanking.sort(this.player_hand_comparer);

    this.fill_side_pots(rotatedPlayers);
    this.evaluate_side_pots(playerRanking);
    this.distribute_side_pots();
  }
}

