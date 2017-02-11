import NapoleonHand from "./NapoleonHand";
export default class Player {
    constructor(props) {
        this.name = props.name;
        this.hand = new NapoleonHand({
            cards: props.cards,
            size: props.size
        });
        this.lost = false;
        this.won = false;
        this.handHidden = false;
    }
    checkDidLose() {
        let status = this.hand.size === 0;
        this.lost = status;
        return status;
    }
    checkDidWin() {
        let status = this.hand.size === 52;
        this.won = status;
        return status;
    }
    fetchData() {
        return {
            allAreGroups: this.hand.allAreGroups,
            lost: this.lost,
            myHand: this.hand.showCards(),
            won: this.won
        };
    }
}