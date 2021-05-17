import secureRandomNumber from "random-number-csprng";

/**
 * Card
 * Rank goes from 2 to 14. Ace = 14, King = 13...
 */
export type Card = {
  suit: string;
  rank: number;
}

/**
 * Deck
  */
export class Deck {
  deck: Card[];
  poppedCards: Card[];
  allSuits: string[] = ['S', 'H', 'C', 'D'];
  rankRange: number[] = Array.from(new Array(13), (_, i) => i + 2);

  constructor() {
    this.deck = [];
    this.poppedCards = [];

    for (const suit of this.allSuits){
      for (const rank of this.rankRange){
        this.deck.push({suit: suit, rank: rank});
      }
    }
  }

  /**
   * shuffle
   * Shuffles the deck with a cryptographically secure random number generator
   *
   * Places the popped cards back into the deck
   * Resets the array of popped cards
   * Shuffles the deck
   */
  async shuffle() {
    this.deck = this.deck.concat(this.poppedCards);
    this.poppedCards.length = 0;
    for (let i = this.deck.length - 1; i > 0; i--){
      const j = await secureRandomNumber(0, i);
      const temp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
    }
  }

  /**
   * pop
   * Get the card from the top of the deck
   */
  pop() {
    var retCard = this.deck.pop();
    this.poppedCards.push(retCard);
    return retCard;
  }
}

