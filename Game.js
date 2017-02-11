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
        let r = {
            allAreGroups: player.hand.allAreGroups,
            currentPlayer: this.currentPlayerName,
            gameLog: this.gameLog,
            lost: player.lost,
            myHand: player.hand.showCards(),
            players: Array.from(this.playerMap.keys()).filter(player => !this.playerMap.get(player).lost && player != playerName),
            won: player.won
        };
        // console.log(r);
        return r;
    }
    attemptTrade(currentPlayer, targetPlayer, card) {
        if (currentPlayer.hand.allAreGroups) {
            if (targetPlayer.hand.hasGroup(card.value)) {
                targetPlayer.hand.removeGroup(card.value);
                currentPlayer.hand.addGroup(card.value);
                return true;
            }
            return false;
        } else {
            if (targetPlayer.hand.hasCard(card)) {
                if (!currentPlayer.hand.hasOneOfGroup(card.value)) return false;
                targetPlayer.hand.removeCard(card);
                currentPlayer.hand.addCard(card);
                console.log("saras");
                return true;
            }
            return false;
        }
    }
    turn(data) {
        if (data.source !== this.currentPlayerName) {
            console.log(`Detected cheating by ${data.source}`);
            return;
        }
        console.log(`
        New turn
        --------
        `);
        console.log(data);
        let currentPlayer = this.playerMap.get(this.currentPlayerName);
        let targetPlayer = this.playerMap.get(data.target);
        let success = this.attemptTrade(currentPlayer, targetPlayer, data.card);
        if (success) {
            targetPlayer.checkDidLose();
            currentPlayer.checkDidWin();
            this.gameLog = [...this.gameLog, `${this.currentPlayerName} took ${targetPlayer.hand.cardInEnglish(data.card)} from ${data.target}!`];
            // return this.gameLog;
        } else {
            this.gameLog = [...this.gameLog, `${this.currentPlayerName} tried to take ${targetPlayer.hand.cardInEnglish(data.card)} from ${data.target}, but failed!`];
            this.currentPlayerName = data.target;
            // return this.gameLog;
        }
    }
}