import { Deck, Card } from "./deck";
import { Player } from "./player";

/**
 * Game
 * Game object which keeps track of the state and flow of the game.
 */

const SIX_MAX = 6;

export class GameObject{
  PREFLOP = 0;
  FLOP = 3;
  TURN = 4
  RIVER = 5
  HEADS_UP = 2

  tableSize = 6;

  // Game state
  players: Player[];
  playerCount = 0;
  nextEmptySeat = 0;
  playerRanking: Player[] = [];
  handDone = true;

  // Game state cards
  deck = new Deck();
  sharedCards: Card[] = [];

  // Game state blinds + dealer position
  dealer = 0;
  smallBlindSeat = -1;
  bigBlindSeat = -1;
  smallBlindAmount = 1;
  bigBlindAmount = 2;

  // Turn management
  actor = 0;
  lastRaiser = -1;
  foldedPlayers = 0;
  allInPlayers = 0;

  // Pot management
  pot = 0;
  totalCall = 0;
  minRaise = 0;
  sidePots: number[] = [];
  sidePotWinners: Player[] = [];
  sidePotTotal: number[] = [];
  sidePotParticipants: Player[][] = [];

  constructor(tableSize = SIX_MAX){
    // Game state
    this.tableSize = tableSize;
    this.players = new Array(this.tableSize);
    this.players.fill(null);
  }

/**
 * MANAGING PLAYERS AND SEATING
 * Seating
 * adding users
 * removing users
 */

  /**
   * update_next_empty_seat
   *
   * Updates the value of this.nextEmptySeat so that it points at an empty seat
   */
  update_next_empty_seat(){
    if (this.playerCount === this.tableSize){
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
      console.log("THROW ERROR? This operation should be blocked somewhere");
      return;
    }
    var addPlayer = new Player(userName, uuid);
    this.players[this.nextEmptySeat] = addPlayer;
    this.update_next_empty_seat();
    this.playerCount += 1;
    this.foldedPlayers += 1;
  }

  /**
   * remove_player
   * input:
   *    player
   * Removes the player from the game
   */
  remove_player(player: Player){
    // var playerIndex = this.playerUserMapping.get_index(player)
    // this.players[playerIndex] = null;
    // this.lastRemovedPlayer = playerIndex;
    // this.playerCount -= 1;
    // this.playerUserMapping.remove_player(player);
    // this.removedPlayers.push(playerIndex);
    console.log(player);
  }

  /**
   * kick_player
   * input:
   *    player
   * Do we treat players with 0 chips differently from those that are disconnected? 0 chips is
   * different, because players with 0 chips still need to manage their sockets to effectively
   * remove themselves from the room
   */
  kick_player(player: Player){
    // var playerIndex = this.playerUserMapping.get_index(player)
    // this.players[playerIndex] = null;
    // this.playerCount -= 1;
    // this.playerUserMapping.remove_player(player);
    // this.zeroChipPlayers.push(playerIndex);
    console.log(player);
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
    //var actor = this.playerUserMapping.get_player(user);
    this.players.forEach(player => {
      if (player.name === userName && player.uuid === uuid){
        player.disconnected = true;
        if (this.handDone === true){
          this.remove_player(player);
        }
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
   * Cycles through and gets us the next player, ignores "null" players
   *
   * If we go to the next round, the next actor needs to reset to after the dealer
   */
  next_player(playerIndex: number){
    // do {
    //   playerIndex = this.cyclic_increment(playerIndex, this.tableSize);
    // }while(this.players[playerIndex] === null)

    // return playerIndex;
    console.log(playerIndex);
    return 0;
  }

  /**
   * next_actor
   *
   * Gets us the next player who has yet to take their turn.
   *
   * 1) Loop through each potential actor, if they are all in or have folded, we skip them.
   *    Special Case:
   *      a) The last raiser is all-in. They cannot act, but we have went full circle. Break
   *      the loop
   *
   *    TODO: Hard prevent any potential infinite-loop by checking the respective variable
   *      And forcing the function to exit beforehand if an inf loop would occur
   *
   * 2) If we went full circle, back to the agressor, the round ends (everybody called or folded)
   *
   * 3) On the first round, if everybody else folds, the action ends on the big blind who is
   *    not considered the last raiser, because they are allowed to re-raise. We need to do a
   *    check in this function to counter this specific case-scenario.
   *
   *    We return here, because we do not want the next actor to calculate their valid moves.
   *
   * 4) If none of the edge cases happen, we have found a player who should get ready to act
   *    We calculate their valid moves
   * Inform the actor of their valid moves (how much they can raise, etc.)
   */
  next_actor(){
    // 1)
    do {
      this.actor = this.next_player(this.actor);

      // 1a)
      if (this.actor === this.lastRaiser){
        break;
      }
    }while(this.current_actor().isAllIn || this.current_actor().folded)

    // 2)
    if (this.actor === this.lastRaiser){
      this.next_round();
      return;
    }

    // 3)
    /**
     * Okay, I hate putting comments in the code like this, but this else seems to be important.
     * We do not want case 2 and case 3 to trigger simultaneously. It breaks the game, because
     * of the way the pot is won, it can be cloned.
     * TODO:
     * Solutions:
     * Class to manage the pot?
     * Make the players actually take from the pot as opposed to relying on math magic and
     * programming logic to maintain the pot
     */
    else if (this.foldedPlayers === this.playerCount - 1){
      this.next_round();
      return;
    }

    // 4)
    this.valid_moves();
  }

  /**
   * current_actor
   */
  current_actor(){
    return this.players[this.actor];
  }

/**
 * GAMEFLOW
 */

  /**
   * new_hand
   * Resets all player hands and game state variables, and then deals the next hand.
   */
  async new_hand(){
    if (this.handDone === false){
      return
    }
    for (const actor of this.players){
      if (actor !== null){
        actor.new_hand();
      }
    }

    // Turn management
    this.lastRaiser = -1;
    this.foldedPlayers = 0;
    this.allInPlayers = 0;

    // Pot management
    this.totalCall = 0;
    this.minRaise = 0;
    var potRemainder = this.sidePotTotal.reduce((a, b) => {
      return a + b;
    }, 0); // the pot remainder is the remainder found in each side pot
    this.pot = potRemainder;
    this.sidePots = [];
    this.sidePotWinners = [];
    this.sidePotTotal = [];
    this.sidePotParticipants = [];

    // Game State
    this.sharedCards = [];
    this.playerRanking = [];
    this.handDone = false;

    // External variables
    //this.removedPlayers = [];
    //this.zeroChipPlayers = [];

    this.dealer = this.next_player(this.dealer);
    this.post_blinds();
    await this.deal_cards();
  }

  /**
   * hand_done
   * Marks the hand as being played out. It is important to disable all the players here, because
   * it is possible for them to send commands to the game object and ruin the game state.
   */
  hand_done(){
    this.handDone = true;
  }

  /**
   * remove_marked_players
   * Remove players if they have 0 chips, or have disconnected
   */
  remove_marked_players(){
    for (const actor of this.players){
      if (actor !== null){
        actor.disable_moves();
        if (actor.disconnected === true){
          this.remove_player(actor);
        }
        else if (actor.stack == 0){
          this.remove_player(actor);
        }
      }
    }
  }

  /**
   * valid_moves
   * Prompts the player to calculate all possible moves they can make. Usually this involves
   * knowing what is the total call they are looking at, as well as what is the minimum raise
   * they are allowed to make.
   *
   * Special cases:
   *
   * 1)
   * Player is looking to re-raise himself. The hand is done at this point (everyone else
   * folded or are all in, so the turn order has returned to the player). The game is at
   * showdown, or everyone else is out and the player has won the pot. The game should be
   * on pause.
   *
   * 2)
   * The player is in the small blind seat on the first round. The minimum raise compared to
   * how much they put into the pot does not line up well (the raise they see does not seem legal).
   * If the player is in the small blind seat, and the amount they put into the pot is exactly
   * the small blind amount, then they are in this case.
   *
   * 3)
   * The player is in the big blind seat on the first round. Even if everybody calls, they are
   * allowed to re-raise. Almost like they are re-raising themselves. This is an illegal move
   * but it is allowed on the first round. Therefore, we must take this into account. If the
   * big blind only invested the big blind into the pot, then they will be in this situation.
   */
  valid_moves(){
    // 1)
    if (this.actor === this.lastRaiser){
      // TODO: Test if the game works without this line, it might be redundant.
      this.current_actor().disable_moves();
      return;
    }

    // 2)
    if (this.current_actor().totalInvestment === this.smallBlindAmount &&
    this.actor === this.smallBlindSeat){
      this.current_actor().valid_moves(this.totalCall, this.minRaise, true);
    }

    // 3)
    else if (this.current_actor().totalInvestment === this.bigBlindAmount &&
    this.actor === this.bigBlindSeat){
      this.current_actor().valid_moves(this.totalCall, this.minRaise, true);
    }

    else{
      this.current_actor().valid_moves(this.totalCall, this.minRaise);
    }

    return this.current_actor();
  }

  /**
   * post_blinds
   * Forces the players to place their blinds into the pot. The player immediately after the
   * big blind is next to act. The big blind is immediately after the small blind.
   *
   * All rules involving blinds:
   * 1)
   *  In a game with more than 2 players, the small blind is immediately after the dealer.
   *  Otherwise, the dealer is the small blind.
   *
   * 2)
   * The first player to act is always immediately after the big blind though.
   *
   * 3)
   * If a player goes all in on the blinds, the minimum amount to call is still the big blind
   * amount. The minimum raise is also the big blind amount. This is as per "Robert's Rules of 
   * Poker". This is dealt with here as the minRaise, and totalCall are set accordingly.
   */
  post_blinds(){
    // 1)
    if (this.playerCount != this.HEADS_UP){
      this.smallBlindSeat = this.next_player(this.dealer);
    }
    else{
      this.smallBlindSeat = this.dealer;
    }
    this.bigBlindSeat = this.next_player(this.smallBlindSeat);

    this.minRaise = this.bigBlindAmount;
    this.update_total_call(this.bigBlindAmount);

    this.pot += this.players[this.smallBlindSeat].place_blind(this.smallBlindAmount);
    this.pot += this.players[this.bigBlindSeat].place_blind(this.bigBlindAmount);

    if (this.players[this.smallBlindSeat].stack === 0){
      this.allInPlayers += 1;
    }
    if (this.players[this.bigBlindSeat].stack === 0){
      this.allInPlayers += 1;
    }

    this.actor = this.next_player(this.bigBlindSeat);
    this.valid_moves();
  }

  /**
   * deal_cards
   * shuffles the deck then deals the cards
   *
   * It's a for loop that is run twice.
   */
  async deal_cards(){
    await this.deck.shuffle();
    for (const user of this.players){
      if (user === null){
      }
      else{
        user.draw_card(this.deck);
      }        
    }
    for (const user of this.players){
      if (user === null){
      }
      else{
        user.draw_card(this.deck);
      }
    }
  }

  /**
   * game_still_active
   * 
   * There are 2 cases I think:
   *
   * 1) Everybody else has folded
   *    a) Money goes to only player left in the pot
   *
   * 2) A combination of folding and all in means only one player (or less) can act
   *    a) We rush to showdown
   */
  game_still_active(){
    // Game is not running, thus it's not active
    if (this.handDone === true){
      return false;
    }

    // 1)
    if (this.foldedPlayers === this.playerCount - 1){
      // 1a)
      for (const actor of this.players){
        if (actor !== null && !actor.folded){
          actor.win_chips(this.pot);
          this.pot = 0;
        }
      }
      return false;
    }
    // 2)
    if (this.foldedPlayers + this.allInPlayers >= this.playerCount - 1){
      // 2a)
      if (this.allInPlayers > 0){
        while(this.sharedCards.length < this.RIVER){
          this.deck.pop();
          this.add_card_to_shared_cards();
        }
        return true;
      }
    }
    return true;
 }

  /**
   * next_round
   * Takes us to the next round of play, when players are done with the betting action.
   * When the betting action is over, there is a chance that a player has won prematurely, or
   * there is an all-in situation that has been called, and we are rushing to the end. This
   * is checked in the function 'game_still_active'.
   * 
   * Check if the game is stale i.e. all but one are all-in/ folded
   *   If the game is no longer active, we need to ping the game controller that the game is
   *   done.
   *   TODO: Write a function that pings the game controller upon game completion
   * 
   * 1)  We are at pre-flop
   *       Go to the flop, 3 cards are added to the shared cards
   * 2)  We are at the flop
   *       Go to the turn, add a card to the shared cards
   * 3)  We are at the turn
   *       Go to the river, add a card to the shared cards
   * 4)  We are at the river
   *       Go to showdown
   */
  next_round(){
    var gameIsActive = this.game_still_active();
    if (!gameIsActive){
      this.hand_done();
      return;
    }

    // 1)
    if (this.sharedCards.length === this.PREFLOP){
      this.flop();
    }
    // 2)
    else if (this.sharedCards.length === this.FLOP){
      this.next_card();
    }
    // 3)
    else if (this.sharedCards.length === this.TURN){
      this.next_card();
    }
    // 4)
    else if (this.sharedCards.length === this.RIVER){
      this.showdown();
    }
  }

  /**
   * flop
   * One card is burned, the other 3 cards go to the flop
   */
  flop(){
    this.lastRaiser = -1;
    this.minRaise = this.bigBlindAmount;
    this.actor = this.dealer;
    this.next_actor();

    this.deck.pop();
    for (var i = 0; i < this.FLOP; i++){
      this.add_card_to_shared_cards();
    }
  }

  /**
   * next_card
   * Burns a card, then draws a card from the deck into the sharedCards array. Used for the
   * turn and river.
   */
  next_card(){
    this.minRaise = this.bigBlindAmount;
    this.lastRaiser = -1;

    this.add_card_to_shared_cards();

    this.actor = this.dealer;
    this.next_actor();
  }

  /**
   * add_card_to_shared_cards
   * Helper function to add a card to the sharedCards array. It also notifies each player
   * of said card which has been added.
   */
  add_card_to_shared_cards(){
    var card = this.deck.pop();
    this.sharedCards.push(card);

    for (const actor of this.players){
      if (actor !== null){
        actor.new_card(card);
      }
    }
  }

  /**
   * player_hand_comparer
   * A function to compare players' hands. When used with the sort function, the players are
   * sorted from strongest to weakest.
   *
   * The handscore works such that the first number which is larger means the hand is stronger.
   * I.e.
   * 6, 2, 3 > 5, 11, 11
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
   * count_winners
   * It tells us how many winners there are in the given player array. This is because ties can
   * occur, in which case, there are multiple winners splitting the pot.
   */
  count_winners(playerArray: Player[]){
    for (var i = 1; i < playerArray.length; i++){
      if (!this.players_tied(playerArray[i], playerArray[0])){
        break;
      }
    }
    return i;
  }

  /**
   * showdown
   * Rank all of the players, ignoring empty seats and players who have folded
   *
   * Push the "total pot" as a side pot, and deal with it using the side pot logic
   */
  showdown(){
    for (const actor of this.players){
      if (actor !== null && !actor.folded){
        actor.handRanker.score_hand();
        this.playerRanking.push(actor);
      }
    }
    this.playerRanking.sort(this.player_hand_comparer);

    this.add_side_pot(this.current_actor().totalInvestment);
    this.evaluate_side_pots();
    this.distribute_side_pots();
    this.hand_done();
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
   * side pot. Therefore, the base case for what a user invests is:
   *
   *          currentSidePotValue - prevSidePotValue
   *
   * We can double check this, because 150 + 100 = 250. Meaning the sum of the side pots is equal
   * to the total chips invested.
   *
   * With that illustrated, the algorithm works as follows:
   *
   * 1) For each player on the table:
   *  2) Loop through each sidepot
   *    a) The player has the chips to put into the sidepot
   *      Put them into the sidepot
   *    b) The player does not have the chips required to "fill" the sidepot
   *      The rest of their chips go into this sidepot, they do not contribute to any further
   *      sidepots.
   */
  fill_side_pots(){
    this.sidePotTotal = new Array(this.sidePots.length);
    this.sidePotTotal.fill(0);

    // 1)
    for (const actor of this.players){
      if (actor !== null){
        var prevSidePot = 0;
        var playerInvestment = actor.totalInvestment;

        // 2)
        for (var i = 0; i < this.sidePots.length; i++){
          var sidePotAmount = this.sidePots[i];
          var costOfSidePot = sidePotAmount - prevSidePot;

          // 2a)
          if (playerInvestment > costOfSidePot){
            playerInvestment -= costOfSidePot;
            this.sidePotTotal[i] += costOfSidePot;
            prevSidePot = sidePotAmount;
          }

          // 2b)
          else{
            this.sidePotTotal[i] += playerInvestment;
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
  evaluate_side_pots(){
    this.fill_side_pots();
    this.sidePotParticipants = new Array(this.sidePots.length);
    for (var i = 0; i < this.sidePotParticipants.length; i++){
      this.sidePotParticipants[i] = new Array();
    }

    for (const actor of this.playerRanking){
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
      this.sidePotTotal[i] = this.distribute_pot(this.sidePotTotal[i], this.sidePotParticipants[i]);
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
   * Distributes the pot amongst the winners and any remaining chips are added onto next round's
   * pot.
   *
   * TODO: chips will disappear in a split pot/ mess up we need to fix this
   * When a player wins chips, the pot subtracts that amount. Therefore, everything will always
   * sum up. No more math magic shenanigans. Needs testing
   */
  distribute_pot(potAmount: number, sortedParticipants: Player[]){
    var winnerCount = this.count_winners(sortedParticipants);
    var individualWinnings = Math.floor(potAmount / winnerCount);

    for (var i = 0; i < winnerCount; i++){
      sortedParticipants[i].win_chips(individualWinnings);
      potAmount -= individualWinnings;
    }
    return potAmount;
  }

/**
 * PLAYER COMMANDS
 */

  /**
   * call
   * The actor calls the pot. This function is only used if the player has enough to call. If not,
   * the player uses the all_in function.
   */
  call(){
    var addToPot = this.current_actor().call();
    if (addToPot === false){
      return false;
    }
    this.pot += addToPot;

    // Calling the big blind means they're calling nobody. They become the last raiser
    if (this.lastRaiser === -1){
      this.lastRaiser = this.actor;
    }
    this.next_actor();
  }

  /**
   * raise
   * The actor raises the pot. They become the lastRaiser/ aggressor. The minimum raise gets
   * updated accordingly.
   */
  raise(amount: number){
    var addToPot = this.current_actor().raise(amount);
    if (addToPot === false){
      return false;
    }
    this.pot += addToPot;
    this.minRaise = this.current_actor().totalInvestment - this.totalCall;
    this.lastRaiser = this.actor;
    this.update_total_call(this.current_actor().totalInvestment);
    this.next_actor();
  }

  /**
   * fold
   * The actor folds
   */
  fold(){
    if (this.current_actor().fold() === false){
      return false;
    }
    this.foldedPlayers += 1;
    this.next_actor();
  }

  /**
   * all_in
   * A side pot is setup for the player who goes all in. If any player bets above this, they
   * are working in a separate pot (the all in player cannot put in anymore chips)
   *
   * Special cases:
   * 1)
   * If you are able to all in, then that means that your all in is a legitimate raise. We use
   * call in to define the cases where a player performs an all in that is not a legitimate
   * raise.
   *
   * In a call-in. The minimum raise is not changed, as the raise is not a legitimate raise,
   * even though the amount to call may increase.
   *
   * 2)
   * If the pot has been raised, we need to update the lastRaiser variable. Even if the
   * player performed a call in and did not perform a "legal" raise, they become the raiser.
   * This is because every other player needs a chance to respond to the new amount which
   * they need to call.
   */
  all_in(){
    var addToPot = this.current_actor().all_in();
    if (addToPot === false){
      return false;
    }


    // 1)
    if (this.current_actor().canAllIn){
      this.minRaise = this.current_actor().totalInvestment - this.totalCall;
    }

    
    // 2)
    if (this.current_actor().totalInvestment > this.totalCall){
      this.lastRaiser = this.actor;
    }

    this.add_side_pot(this.current_actor().totalInvestment);
    this.allInPlayers += 1;
    this.pot += addToPot;
    this.update_total_call(this.current_actor().totalInvestment);
    this.next_actor();
  }

  /**
   * update_total_call
   * The total call should only ever go up. A function to avoid mistakes and avoid having
   * to rewrite the same check over and over.
   */
  update_total_call(newValue: number){
    if (this.totalCall < newValue){
      this.totalCall = newValue;
    }
  }
/**
 * POT MANAGEMENT COMMANDS
 */

  /**
   * add_side_pot
   * parameters
   *  potSize - The size of the side pot which we are adding. The size is defined as how much
   *    the player went all in. It is not the total amount of chips in said side pot. For example,
   *    if the player went all in for 50 chips, a side pot is set up and the potSize variable
   *    is set at 50.
   *
   * The sidePots array is always sorted from smallest side pot to largest. The side pots are 
   * also inserted based on this knowledge.
   *
   * Special cases when inserting into a sorted array:
   * 1)
   * Array empty
   *  put the number in
   *
   * 2)
   * The new input element is less than smallest number 
   *  We insert at beginning
   *
   * 3)
   * Input greater than largest number in the array
   *  Push the number ontop of it
   *
   * 4)
   * Otherwise, insert it via looping
   *  Special case:
   *  a)
   *    Two players all in for the same amount. Do not create another sidepot
   */
  add_side_pot(potSize: number){
    // 1)
    if (this.sidePots.length === 0){
      this.sidePots.push(potSize);
      return;
    }

    // 2)
    else if(potSize < this.sidePots[0]){
      this.sidePots.unshift(potSize);
      return;
    }

    // 3)
    else if(potSize > this.sidePots[this.sidePots.length - 1]){
      this.sidePots.push(potSize);
      return;
    }

    // 4)
    else{
      var sidePotsLength = this.sidePots.length;
      for (var i = 0; i < sidePotsLength; i++){
        // 4a)
        if (this.sidePots[i] === potSize){
          return;
        }
        if (this.sidePots[i] > potSize){
          this.sidePots.splice(i, 0, potSize);
          return;
        }
      }
    }
  }

/**
 * DEBUG COMMANDS
 */
  /**
   * print_board
   * Prints the board state to the console
   */
  print_board(){
    for (var i = 0; i < this.players.length; i++){
      var actor = this.players[i];
      if (actor != null){
        console.log(actor.name + ": " + actor.stack);
        console.log(actor.hand);
      }
    }
    console.log(""); 
    console.log("Shared cards: ");
    console.log(this.sharedCards);
    console.log(""); 

    console.log("Pot: " + this.pot);
    console.log("Side pots: " + this.sidePots);
    if (this.players[this.dealer] === null){
      console.log("Dealer is null, the index is: ", this.dealer);
    }
    else{
      console.log("Dealer: " + this.players[this.dealer].name);
    }
    console.log("SB: " + this.smallBlindSeat);
    console.log("BB: " + this.bigBlindSeat);
    if (this.current_actor() === null){
      console.log("Actor is null, the index is: ", this.actor);
    }
    else{
      console.log("Actor: " + this.current_actor().name);
      console.log("min-raise: " + this.minRaise);
      console.log("call: " + this.current_actor().amountToCall);
    }
  }

  /**
   * force_reset
   * Reset the game state i.e. all player's chips
   */
  force_reset(){

  }
}
