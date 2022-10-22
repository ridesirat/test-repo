const origin = ""//"https://culturecrossover.eu";
let lang = "eng";
let appReady = false;
let deferredPrompt;
let gameNumber = 'game';
let player;

const pages = {
    //"index.html": "main-page",
    //"start": "start-page",
    "index.html": "lang-page",
    "players": "player-page",
    "scores": "score-page",
    "materials": "materials-page",
    "404": "404-page",
    "fortune": "fortune-page",
    "dice": "dice-page",
    "trivia": "trivia-page",
    "culture": "culture-page"
}



Array.prototype.shuffle = function () {
    let input = this;
    for (let i = input.length - 1; i >= 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1));
        let itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}

const navigate = async () => {
    let path = window.location.pathname.split('/').pop()
    let page = pages[path] || pages[404];
    let newPage = document.createElement(page)
    newPage.className = 'page';
    let current = document.querySelector('.page')
    current.disconnect();
    current.parentNode.replaceChild(newPage, current)
};

const clickHandle = event => {
    event.preventDefault();
    let { currentTarget, target } = event;
    currentTarget[target.dataset.event]?.(event)
    if (target.dataset.page) {
        window.history.pushState({}, "", `${origin}${target.dataset.page}`);
        navigate();
    }
};

window.onpopstate = navigate;

//const channel = new BroadcastChannel('loading')
//channel.onmessage = ({ data }) => data.status == 'loaded' ? appReady() : appFailed();


class baseElement extends HTMLElement {
    constructor() { super() }

    handleCLicks = clickHandle;

    render(selector) {
        let temp = document.querySelector(`[part = ${selector}]`).content.cloneNode(true);
        this.appendChild(temp);
    }

    unselect() {
        let nodes = document.querySelectorAll('.selected')
        for (let el of nodes) { el.classList.remove('selected') }

    }

    async disconnect() { this.removeEventListener('click', this.handleCLicks) }

    connectedCallback() { this.addEventListener('click', clickHandle); }

    back() { history.back() }

}

/* removing page

class mainPage extends baseElement {
    constructor() { super() }

    async app({ target }) {
        let prompt = await deferredPrompt.prompt();
        let choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
            deferredPrompt = null;
            target.style.display = none;
        }
    }
    connectedCallback() { this.render('main-page'); super.connectedCallback() }
}

*/





class langPage extends baseElement {
    constructor() { super() }

    setLanguage(event) { lang = event.target.dataset.lang; }

    connectedCallback() { this.render('lang-page'); super.connectedCallback() }
}








class playerPage extends baseElement {
    constructor() { super() }

    plus() {
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items) || { players: [] }
        let inputs = document.querySelectorAll('input')
        for (let i = 0, len = inputs.length; i < len; i++) {
            if (inputs[i].value) game.players[i].name = inputs[i].value;
        }
        game.players.push({ name: undefined, badges: 0, visa: 0, ticket: 0 })
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff();


    }

    minus({ target }) {
        player = undefined;
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let inputs = document.querySelectorAll('input')
        for (let i = 0, len = inputs.length; i < len; i++) {
            if (inputs[i].value) game.players[i].name = inputs[i].value;
        }
        game.players.splice(target.dataset.index, 1);
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff()

    }

    start() {
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let inputs = document.querySelectorAll('input')
        for (let i = 0, len = inputs.length; i < len; i++) {
            if (inputs[i].value) game.players[i].name = inputs[i].value;
            else game.players[i].name = `P${i + 1}`

        }
        localStorage.setItem(gameNumber, JSON.stringify(game))
    }
    connectedCallback() { this.render('player-page'); super.connectedCallback() }
}



class scorePage extends baseElement {
    constructor() { super() }
    select({ target }) {
        document.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'))
        target.className = 'selected'
        player = target.dataset.prop;
    }
    plus() {
        let element;
        if (player == undefined) { element = document.querySelector(".selected"); player = element.dataset.prop }
        else element = document.querySelector(`[data-prop = "${player}"]`)
        let value = parseInt(element.value) + 1;
        element.value = value;
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let [i, type] = player.split('-');
        game.players[i][type] = value;
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff()
    }
    minus() {
        let element;
        if (player == undefined) { element = document.querySelector(".selected"); player = element.dataset.prop }
        else element = document.querySelector(`[data-prop = "${player}"]`)
        let value = parseInt(element.value) - 1;
        if (value < 0) return
        element.value = value;
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let [i, type] = player.split('-');
        game.players[i][type] = value;
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff()
    }

    dice() { window.open("https://app.culturecrossover.eu/dice/"); }
    connectedCallback() { this.render('score-page'); super.connectedCallback() }
}



class errorPage extends baseElement {
    constructor() { super() }


}

class triviaPage extends baseElement {
    constructor() { super() }

    lang({ target }) {
        let node = document.createElement('trivia-card')
        node.dataset.url = `https://app.culturecrossover.eu/wp-json/crossover/${lang}/trivia-cards/${target.dataset.country}`
        node.dataset.clang = `${target.dataset.country}`
        node.className = 'center'
        target.parentNode.replaceWith(node)
    }

    select({ target }) {
        if (target.dataset.val === "correct") {
            target.style.backgroundColor = "green"
            target.style.color = "#fff"
        }
        else { target.style.backgroundColor = "red" }
    }
    connectedCallback() { this.render('trivia-page'); super.connectedCallback() }
}

class fortunePage extends baseElement {
    constructor() { super() }

    select() {

    }
    connectedCallback() { this.render('fortune-page'); super.connectedCallback() }
}

class culturePage extends baseElement {
    constructor() { super() }

    lang({ target }) {
        let node = document.createElement('culture-card')
        node.dataset.url = `https://app.culturecrossover.eu/wp-json/crossover/${lang}/culture-cards/${target.dataset.country}`
        node.dataset.clang = `${target.dataset.country}`
        node.className = 'center'
        target.parentNode.replaceWith(node)
    }

    select({ target }) {
        if (target.dataset.val === "correct") {
            target.style.backgroundColor = "green"
            target.style.color = "#fff"
        }
        else { target.style.backgroundColor = "red" }
    }
    connectedCallback() { this.render('culture-page'); super.connectedCallback() }
}

// Turned off to present as before while fixing the Dice page

// class dicePage extends baseElement {
// 	constructor() { super() }

// 	select() {

// 	}
// 	connectedCallback() { this.render('dice-page'); super.connectedCallback() }
// }


customElements.define('base-element', baseElement)
//customElements.define('main-page', mainPage)
customElements.define('lang-page', langPage)
customElements.define('player-page', playerPage)
customElements.define('score-page', scorePage)


customElements.define('fortune-page', fortunePage)
// customElements.define('dice-page', dicePage) Turned of while dice is not working
customElements.define('trivia-page', triviaPage)
customElements.define('culture-page', culturePage)
//customElements.define('404-page', errorPage)


// Number of cards

class slotElement extends HTMLElement {
    constructor() { super() }
    connectedCallback() { if (this.diff) this.diff() }

    setCards() {
        localStorage.setItem('cards', JSON.stringify({
            fortune: {},
            trivia: {},
            culture: {},
        }))
    }
}


class playerBoard extends slotElement {
    constructor() { super() }

    diff() {
        let find = localStorage.getItem(gameNumber);
        let get = JSON.parse(find) || { players: [] }
        let players = get.players;
        let frag = document.createElement('template')
        let str = "";
        for (let i = 0, len = players.length; i < len; i++) {
            let p = players[i]
            str +=
                `<input type="text"  ${p.name ? `value = "${p.name}"` : `placeholder = "P${i + 1}"`}><svg data-event = "minus" class = 'svg-icon' class = 'svg-icon' data-index = ${i} fill="none" xmlns="http://www.w3.org/2000/svg" > <use href="#minus"/></svg>`
        };
        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)


    }
}

class scoreBoard extends slotElement {
    constructor() { super() }

    diff() {
        let get = JSON.parse(localStorage.getItem(gameNumber));
        let players = get.players;
        let frag = document.createElement('template')
        let str = "";
        for (let i = 0, len = players.length; i < len; i++) {
            let p = players[i];
            str +=
                `<score-row>
            <strong data-prop="0-name" >${p.name}</strong>
            <input readonly data-event='select' data-prop="${i}-badges" value = ${p.badges}></input>
            <!-- This was abandoned
				<input readonly data-event='select' data-prop="${i}-visa" value = ${p.visa}></input> -->
            <input readonly data-event='select' data-prop="${i}-ticket" value = ${p.ticket}></input>
        </score-row>`
        };
        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        let selected = document.querySelectorAll(`[data-prop = "${player}"]`).forEach(el => el.classList.add('selected'))
        let sel = document.querySelectorAll('.selected')
        if (sel.length == 0) document.querySelector('input').classList.add('selected')

    }
}


class triviaCard extends slotElement {
    constructor() { super() }
    async diff() {
        let url = this.dataset.url
        let clang = this.dataset.clang;
        console.log(clang)
        let get = localStorage.getItem('cards')
        if (get == undefined) { await super.setCards(); get = localStorage.getItem('cards') }
        let cards = JSON.parse(get);
        let find = await fetch(url)
        if (!find.ok) return alert('network connection error')
        let parsed = await find.json();
        if (!cards.trivia[clang] || cards.trivia[clang] !== parsed.length) cards.trivia[clang] = { deck: [...Array(parsed.length).keys()].shuffle(), iter: 0 }
        let iter = cards.trivia[clang].iter;
        let deck = cards.trivia[clang].deck;
        console.log(deck)
        if (iter >= deck.length) { iter = 0; cards.trivia[clang].iter = 0; cards.trivia[clang].deck = [...Array(deck.length).keys()].shuffle(); }
        let trivia = parsed[deck[iter]]
        let frag = document.createElement('template')

        let str =
            `${trivia.question}
        <br>
        <button data-event = "select" data-val = ${trivia.correct == "A" ? "correct" : "incorrect"}>${trivia.opt_a}</button
        <br>
        <button data-event = "select" data-val = ${trivia.correct == "B" ? "correct" : "incorrect"}>${trivia.opt_b}</button
        <br>
        <button data-event = "select" data-val = ${trivia.correct == "C" ? "correct" : "incorrect"}>${trivia.opt_c}</button`

        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        let selected = document.querySelectorAll(`[data-prop = "${player}"]`).forEach(el => el.classList.add('selected'))
        cards.trivia.iter++;
        localStorage.setItem('cards', JSON.stringify(cards))
    }

}

class fortuneCard extends slotElement {
    constructor() { super() }

    async diff() {
        let get = localStorage.getItem('cards')
        if (get == undefined) { await super.setCards(); get = localStorage.getItem('cards') }
        let cards = JSON.parse(get);
        let find = await fetch(`https://app.culturecrossover.eu/wp-json/crossover/${lang}/fortune-cards`)
        if (!find.ok) return alert('network connection error')
        let parsed = await find.json();
        if (!cards.fortune[lang] || cards.fortune[lang] !== parsed.length) cards.fortune[lang] = { deck: [...Array(parsed.length).keys()].shuffle(), iter: 0 }
        let iter = cards.fortune[lang].iter;
        let deck = cards.fortune[lang].deck;

        if (iter >= deck.length) { iter = 0; cards.fortune[lang].iter = 0; cards.fortune[lang].deck }
        let fortune = parsed[deck[iter]]

        let frag = document.createElement('template')
        let str = `${fortune.fortune}`
        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        fortune.unlucky ? document.querySelector(".page").style.backgroundColor = "#e94e15" : document.querySelector(".page").style.backgroundColor = "#59ba9d"
        cards.fortune.iter++;
        localStorage.setItem('cards', JSON.stringify(cards))
    }
}

class cultureCard extends slotElement {
    constructor() { super() }
    async diff() {
        let url = this.dataset.url
        let clang = this.dataset.clang;
        console.log(clang)
        let get = localStorage.getItem('cards')
        if (get == undefined) { await super.setCards(); get = localStorage.getItem('cards') }
        let cards = JSON.parse(get);
        let find = await fetch(url)
        if (!find.ok) return alert('network connection error')
        let parsed = await find.json();
        if (!cards.culture[clang] || cards.culture[clang] !== parsed.length) cards.culture[clang] = { deck: [...Array(parsed.length).keys()].shuffle(), iter: 0 }

        let iter = cards.culture[clang].iter;
        let deck = cards.culture[clang].deck;
        console.log(deck)
        if (iter >= deck.length) { iter = 0; cards.culture[clang].iter = 0; cards.culture[clang].deck = [...Array(deck.length).keys()].shuffle(); }

        let culture = parsed[deck[iter]]

        let frag = document.createElement('template')
        let str =
            `<div class="culture-question">${culture.question}</div>
			
			${culture.opt_a ?
                `<button data-event = "select" data-val = ${culture.correct == "A" ? "correct" : "incorrect"}>${culture.opt_a}</button>
			<br>
			<button data-event = "select" data-val = ${culture.correct == "B" ? "correct" : "incorrect"}>${culture.opt_b}</button>
			<br>
			<button data-event = "select" data-val = ${culture.correct == "C" ? "correct" : "incorrect"}>${culture.opt_c}</button>
			<div class="culture-answer">
				${culture.explain}
				</div>
			`
                : ``}
			${culture.truth ?
                `<button data-event = "select" data-val = ${culture.truth == "true" ? "correct" : "incorrect"}>TRUE</button>
				<br>
				<button data-event = "select" data-val = ${culture.truth == "false" ? "correct" : "incorrect"}>FALSE</button>
				<br>
				</div>
				<div class="culture-answer">
				${culture.explain}
				</div>
				`
                : ``} <div class="culture-answer">
				${culture.explain}
				</div>`

        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        let selected = document.querySelectorAll(`[data-prop = "${player}"]`).forEach(el => el.classList.add('selected'))
        cards.culture.iter++;
        localStorage.setItem('cards', JSON.stringify(cards))
    }

}

customElements.define("player-board", playerBoard)
customElements.define("score-board", scoreBoard)

customElements.define("trivia-card", triviaCard)
customElements.define("fortune-card", fortuneCard)
customElements.define("culture-card", cultureCard)
