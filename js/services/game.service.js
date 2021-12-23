import FaceApiService from './face-api.service.js';
import JokesService from './jokes.service.js';
import { setTextElement } from '../helpers/index.js';
import '../types/joke.js';

export default class GameService {
    #video;
    #jokesWrapper;
    #gameOverMessage;
    #jokesService;
    #faceApiService;
    #gameConfig;

    /**
     * The game service
     */
    constructor() {
        this.#video = document.querySelector('#video');
        this.#jokesWrapper = document.querySelector('#jokes');
        this.#gameOverMessage = document.querySelector('#game-over-message');
        this.#jokesService = new JokesService();
        this.#faceApiService = new FaceApiService(this.#video);
        this.#gameConfig = Object.freeze({
            jokesAmount: 5,
            jokesDuration: 10, // seconds
            laughThreshold: 0.9, // 0 - 1
            gameOverScreenDuration: 4 // seconds
        });

        // Sets the custom property for the punchline reveal animation delay
        document.documentElement.style.setProperty(
            '--punchline-reveal',
            `${(this.#gameConfig.jokesDuration / 3) * 1000}ms`
        );
    }

    /**
     * Initializes the game
     */
    async init() {
        const jokes = this.#jokesService.getRandomJokes(this.#gameConfig.jokesAmount);

        document.body.classList.add('game-initialized');

        for (const joke of jokes) {
            const laughed = await this.#setJoke(joke);

            if (laughed) {
                this.#setGameOverMessage('LOSE');
                break;
            }
        }

        this.#setGameOverMessage('WIN');
        document.body.classList.remove('game-initialized');

        setTimeout(() => {
            document.body.classList.remove('game-ended');
        }, this.#gameConfig.gameOverScreenDuration * 1000);
    }

    /**
     * Sets the current joke
     * @param {Joke} joke The joke
     * @returns {Promise<boolean>} A promise that resolves true or false depending if the player laughs or not
     */
    #setJoke(joke) {
        this.#setJokeElement(joke);

        return new Promise((resolve, _) => {
            // The joke passes after [X] seconds (see game configuration)
            let timeout = setTimeout(() => {
                clearInterval(interval);
                resolve(false);
            }, this.#gameConfig.jokesDuration * 1000);

            // Get face recognition detections, if happiness is over 0.85 the player loses
            let interval = setInterval(() => {
                const detections = this.#faceApiService.detections;

                if (detections && detections.expressions) {
                    const happiness = detections.expressions.happy;

                    document.body.classList[happiness > 0.5 ? 'add' : 'remove']('danger');

                    if (happiness > this.#gameConfig.laughThreshold) {
                        clearTimeout(timeout);
                        clearInterval(interval);
                        document.body.classList.remove('danger');
                        resolve(true);
                    }
                }
            }, 100);
        });
    }

    /**
     * Sets the joke HTML Element
     * @param {Joke} joke The joke
     */
    #setJokeElement(joke) {
        const jokeElement = document.createElement('div');
        const setup = setTextElement('h2', joke.setup, 'setup');
        const punchline = setTextElement('h2', joke.punchline, 'punchline');

        jokeElement.classList.add('joke');
        jokeElement.append(setup, punchline);
        this.#jokesWrapper.innerHTML = '';
        this.#jokesWrapper.append(jokeElement);
    }

    /**
     * Sets the game over message
     * @param {string} message The message
     */
    #setGameOverMessage(message) {
        const h1 = this.#gameOverMessage.querySelector('h1');
        h1.innerHTML = h1.innerHTML.replace('{{result}}', message);
        this.#jokesWrapper.innerHTML = '';
        document.body.classList.add('game-ended');
    }
}
