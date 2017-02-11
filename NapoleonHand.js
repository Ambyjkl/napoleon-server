export default class NapoleonHand {
    constructor(props) {
        this.cards = props.cards;
        this.size = props.size;
        this.allAreGroups = false;
        for (let i = 0; i < 13; ++i) {
            this.checkIsGroup(i);
        }
        this.checkAllAreGroups();
    }
    unparseCard(valueNum, suitNum) {
        valueNum++;
        let suit;
        let value;
        switch (suitNum) {
            case 0:
                suit = "s";
                break;
            case 1:
                suit = "h";
                break;
            case 2:
                suit = "c";
                break;
            default:
                suit = "d";
        }
        switch (valueNum) {
            case 1:
                value = "A";
                break;
            case 11:
                value = "J";
                break;
            case 12:
                value = "Q";
                break;
            case 13:
                value = "K";
                break;
            default:
                value = String(valueNum);
        }
        return {
            value: value,
            suit: suit
        };
    }
    parseValue(value) {
        let valueNum;
        switch (value) {
            case "A":
                valueNum = 1;
                break;
            case "J":
                valueNum = 11;
                break;
            case "Q":
                valueNum = 12;
                break;
            case "K":
                valueNum = 13;
                break;
            default:
                valueNum = Number(value);
        }
        return valueNum;
    }
    parseSuit(suit) {
        let suitNum = 0;
        switch (suit) {
            case "d":
                suitNum++;
            case "c":
                suitNum++;
            case "h":
                suitNum++;
        }
        return suitNum;
    }
    parseCard(card) {
        let valueNum = this.parseValue(card.value);
        let suitNum = this.parseSuit(card.suit);
        return {
            valueNum,
            suitNum
        };
    }
    hasCard(card) {
        let parsedCard = this.parseCard(card);
        console.log(parsedCard);
        console.log(this.cards);
        return this.cards[parsedCard.valueNum - 1][parsedCard.suitNum];
    }
    hasOneOfGroup(value) {
        let valueNum = this.parseValue(value);
        for (let i = 0; i < 4; ++i) {
            if (this.cards[valueNum - 1][i]) return true;
        }
        return false;
    }
    hasGroup(value) {
        let valueNum = this.parseValue(value);
        return this.cards[valueNum - 1][4];
    }
    checkAllAreGroups() {
        if (this.size % 4) {
            return false;
        }
        for (let i = 0; i < 13; ++i) {
            if (this.cards[i][4] === false) {
                for (let j = 0; j < 4; ++j) {
                    if (this.cards[i][j] === true) {
                        return false;
                    }
                }
            }
        }
        this.allAreGroups = true;
        return true;
    }
    checkIsGroup(valueNum) {
        this.cards[valueNum][4] = this.cards[valueNum][0] && this.cards[valueNum][1] && this.cards[valueNum][2] && this.cards[valueNum][3];
    }
    addCard(card) {
        let parsedCard = this.parseCard(card);
        this.cards[parsedCard.valueNum - 1][parsedCard.suitNum] = true;
        this.size++;
        this.checkIsGroup(parsedCard.valueNum - 1);
        this.checkAllAreGroups();
    }
    removeCard(card) {
        let parsedCard = this.parseCard(card);
        this.cards[parsedCard.valueNum - 1][parsedCard.suitNum] = false;
        this.size--;
        this.checkAllAreGroups();
    }
    addGroup(value) {
        let valueNum = this.parseValue(value);
        this.cards[valueNum - 1][4] = true;
        this.size += 4;
    }
    removeGroup(value) {
        let valueNum = this.parseValue(value);
        for (let i = 0; i < 5; ++i) {
            this.cards[valueNum - 1][i] = false;
        }
        this.size -= 4;
    }
    showCards() {
        let cardsList = [];
        for (let valueNum = 0; valueNum < 13; ++valueNum) {
            let allPresent = true;
            for (let suitNum = 0; suitNum < 4; ++suitNum) {
                if (this.cards[valueNum][suitNum]) {
                    cardsList.push(this.unparseCard(valueNum, suitNum));
                } else {
                    allPresent = false;
                }
            }
            if (allPresent) {
                this.cards[valueNum][4] = true;
            }
        }
        return cardsList;
    }
    cardInEnglish(card) {
        if (this.hasGroup(card.value)) {
            let pluralValues = ["Aces", "Twos", "Threes", "Fours", "Fives", "Sixes", "Sevens", "Eights", "Nines", "Tens", "Jacks", "Queens", "Kings"];
            let valueNum = this.parseValue(card.value);
            return `all the ${pluralValues[valueNum - 1]}`;
        }
        let values = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
        let parsedCard = this.parseCard(card);
        let suits = ["Spades", "Hearts", "Clubs", "Diamonds"];
        return `${values[parsedCard.valueNum - 1]} of ${suits[parsedCard.suitNum]}`;
    }
}