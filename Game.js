import Player from "./Player";
export default class Game {
    constructor(players) {
        let deck = new Set();
        for (let i = 0; i < 52; ++i) {
            deck.add(i);
        }
        let numberOfPlayers = players.length;
        let remainder = 52 % numberOfPlayers;
        let quotient = Math.floor(52 / numberOfPlayers);
        this.playerMap = new Map();
        this.gameLog = ["The game has started"];
        for (let name of players) {
            let cards = [];
            for (let i = 0; i < 13; ++i) {
                cards.push([false, false, false, false, false]);
            }
            let count = quotient;
            if (remainder > 0) {
                count++;
            }
            remainder--;
            for (let i = 0; i < count; ++i) {
                let randomI = Math.floor(Math.random() * deck.size);
                let randomCardNum;
                for (let cardNum of deck) {
                    if (randomI-- == 0) {
                        randomCardNum = cardNum;
                        break;
                    }
                }
                deck.delete(randomCardNum);
                let suitNum = Math.floor(randomCardNum / 13);
                let valueNum = randomCardNum % 13;
                cards[valueNum][suitNum] = true;
                if (valueNum == 0 && suitNum == 0) {
                    this.currentPlayerName = name;
                }
            }
            let nextPlayer = new Player({
                name: name,
                cards: cards,
                size: count
            });
            this.playerMap.set(name, nextPlayer);
        }
    }
    fetchData(playerName) {
        let player = this.playerMap.get(playerName);
        let r = player.fetchData();
        let myHand;
        if (player.handHidden === false) {
            if (player.hand.allAreGroups) {
                player.handHidden = true;
            }
            myHand = player.hand.showCards();
        } else {
            myHand = [];
        }
        r = {
            ...r,
            currentPlayer: this.currentPlayerName,
            gameLog: this.gameLog,
            gameOver: Array.from(this.playerMap.values()).reduce((acc, p) => acc && (p.won || p.lost), true),
            myHand,
            players: Array.from(this.playerMap.keys()).filter(player => !this.playerMap.get(player).lost && player != playerName)
        };
        console.log(r);
        return r;
    }
    attemptTrade(currentPlayer, targetPlayer, card) {
        if (currentPlayer.hand.allAreGroups) {
            if (targetPlayer.hand.hasGroup(card.value)) {
                targetPlayer.hand.removeGroup(card.value);
                currentPlayer.hand.addGroup(card.value);
                return 1;
            }
            return 0;
        } else {
            if (!currentPlayer.hand.hasOneOfGroup(card.value)) return -1;
            if (targetPlayer.hand.hasCard(card)) {
                targetPlayer.hand.removeCard(card);
                currentPlayer.hand.addCard(card);
                return 1;
            }
            return 0;
        }
    }
    turn(data) {
        if (data.source !== this.currentPlayerName) {
            //console.log(`${data.source} tried to cheat by trying to play when it wasn't their turn!`);
            return false;
        }
        // console.log(`
        // New turn
        // --------
        // `);
        // console.log(data);
        const currentPlayer = this.playerMap.get(this.currentPlayerName);
        const targetPlayer = this.playerMap.get(data.target);
        const targetCardName = targetPlayer.hand.cardInEnglish(data.card);
        const success = this.attemptTrade(currentPlayer, targetPlayer, data.card);
        if (success === 1) {
            const targetLost = targetPlayer.checkDidLose();
            const sourceWon = currentPlayer.checkDidWin();
            this.gameLog = [...this.gameLog, `${this.currentPlayerName} took ${targetCardName} from ${data.target}! ${targetLost ? `${data.target} lost!` : ""} ${sourceWon ? `${this.currentPlayerName} won!` : ""}`];
        } else {
            if (success === 0) {
                this.gameLog = [...this.gameLog, `${this.currentPlayerName} tried to take ${targetCardName} from ${data.target}, but failed!`];
                this.currentPlayerName = data.target;
            } else {
                //this.gameLog = [...this.gameLog, `${this.currentPlayerName} tried to cheat by asking for a card with a value they didn't have!`];
                return false;
            }
        }
        return true;
        // console.log(`
        // After
        // -----
        // `);
        // console.log("source: ", currentPlayer.fetchData());
        // console.log("target: ", targetPlayer.fetchData());
    }
}