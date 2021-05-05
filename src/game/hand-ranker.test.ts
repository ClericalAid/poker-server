import {HandRanker} from "./hand-ranker"

describe("The HandRanker", function(){
  const handRanker = new HandRanker();
  beforeEach(() => {
    handRanker.reset();
  });

  it("accepts cards and stores them properly", async() =>{
    handRanker.add_card({suit: "D", rank: 4});
    handRanker.add_card({suit: "S", rank: 12});
    handRanker.add_card({suit: "D", rank: 2});
    handRanker.add_card({suit: "C", rank: 9});
    handRanker.add_card({suit: "C", rank: 7});
    handRanker.add_card({suit: "H", rank: 12});
    handRanker.add_card({suit: "D", rank: 6});

    expect(handRanker.spades).toStrictEqual([12])
    expect(handRanker.hearts).toStrictEqual([12])
    expect(handRanker.clubs).toStrictEqual([9, 7])
    expect(handRanker.diamonds).toStrictEqual([4, 2, 6])
  });

  it("Recognizes a straight flush", async() =>{
    handRanker.add_card({suit: "D", rank: 4});
    handRanker.add_card({suit: "D", rank: 5});
    handRanker.add_card({suit: "D", rank: 6});
    handRanker.add_card({suit: "D", rank: 7});
    handRanker.add_card({suit: "D", rank: 8});
    handRanker.add_card({suit: "D", rank: 14});
    handRanker.add_card({suit: "C", rank: 8});

    const score = handRanker.score_hand();
    expect(score).toStrictEqual([9, 8])
  });

  it("Grabs the correct kicker when there is a quad", async() =>{
    handRanker.add_card({suit: "D", rank: 3});
    handRanker.add_card({suit: "S", rank: 3});
    handRanker.add_card({suit: "H", rank: 3});
    handRanker.add_card({suit: "C", rank: 3});
    handRanker.add_card({suit: "S", rank: 8});
    handRanker.add_card({suit: "H", rank: 8});
    handRanker.add_card({suit: "S", rank: 10});

    const score = handRanker.score_hand();
    expect(score).toStrictEqual([8, 3, 10]);
  });

  it("Recognizes a full house and chooses the best full house available", async() =>{
  });

  it("Grabs the correct kicker when there are 3 pairs (lone card)", async() =>{
    handRanker.add_card({suit: "D", rank: 6});
    handRanker.add_card({suit: "S", rank: 6});
    handRanker.add_card({suit: "S", rank: 3});
    handRanker.add_card({suit: "H", rank: 3});
    handRanker.add_card({suit: "C", rank: 8});
    handRanker.add_card({suit: "S", rank: 8});
    handRanker.add_card({suit: "S", rank: 10});

    const score = handRanker.score_hand();
    expect(score).toStrictEqual([3, 8, 6, 10]);
  });

  it("Grabs the correct kicker when there are 3 pairs (paired card)", async() =>{
    handRanker.add_card({suit: "D", rank: 6});
    handRanker.add_card({suit: "S", rank: 6});
    handRanker.add_card({suit: "S", rank: 3});
    handRanker.add_card({suit: "H", rank: 3});
    handRanker.add_card({suit: "C", rank: 8});
    handRanker.add_card({suit: "S", rank: 8});
    handRanker.add_card({suit: "S", rank: 2});

    const score = handRanker.score_hand();
    expect(score).toStrictEqual([3, 8, 6, 3]);
  });
});
