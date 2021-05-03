import {Deck} from "./deck"
import secureRandomNumber from "random-number-csprng";
jest.mock("random-number-csprng");
const mockedSecureRandom = secureRandomNumber as jest.MockedFunction<typeof secureRandomNumber>;


describe("The deck", function(){
  let testDeck = new Deck();
  beforeEach(() => {
    testDeck = new Deck();
    const response = 1;
    mockedSecureRandom.mockResolvedValue(response);
  });

  it("has 52 cards", async() =>{
    expect(testDeck.deck.length).toBe(52)
  });

  it("shuffles the deck", async () => {
    expect(testDeck.deck.length).toBe(52);
    await testDeck.shuffle();
    console.log(mockedSecureRandom.mock.calls);
    console.log(mockedSecureRandom.mock.calls.length);
    expect(testDeck.deck[51].rank).toBe(3);
  });

  it("shuffling restores popped cards", async() =>{
    testDeck.pop();
    testDeck.pop();
    testDeck.pop();
    expect(testDeck.deck.length).toBe(49);
    await testDeck.shuffle();
    expect(testDeck.deck.length).toBe(52)
  });
});
