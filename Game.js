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
            for (let i = 0; i < 13; ++i) {
                nextPlayer.hand.checkIsGroup(i);
            }
            nextPlayer.hand.checkAllAreGroups();
            this.playerMap.add(name, nextPlayer);
        }
    }
    fetchData(playerName) {
        let player = this.playerMap[playerName];
        return {
            players: this.playerMap.keys().filter((player)=> {
                return !this.playerMap[player].lost;
            }),
            myHand: player.hand.showCards(),
            currentPlayer: this.currentPlayerName,
            lost: player.lost,
            allAreGroups: player.hand.allAreGroups
        };
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
                targetPlayer.hand.removeCard(card);
                currentPlayer.hand.addCard(card);
                return true;
            }
            return false;
        }
    }
    turn(data) {
        let currentPlayer = this.playerMap[this.currentPlayerName];
        let targetPlayer = this.playerMap[data.target];
        let success = this.attemptTrade(currentPlayer, targetPlayer, data.card);
        if (success) {
            targetPlayer.checkDidLose();
        } else {
            this.currentPlayerName = data.target;
        }
    }
}