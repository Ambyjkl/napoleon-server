import NapoleonHand from "./NapoleonHand";
export default class Player {
    constructor(props) {
        this.name = props.name;
        this.hand = new NapoleonHand({
            cards: props.cards,
            size: props.size
        });
        this.lost = false;
    }
    checkDidLose() {
        let status = this.cards.size === 0;
        this.lost = status;
        return status;
    }
}