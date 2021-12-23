import { jokes } from '../common/jokes.js';
import '../types/joke.js';

export default class JokesService {
    /**
     * The jokes service
     */
    constructor() {}

    /**
     * Gets any number (5 by default) of jokes, optionally, a joke type can be defined
     * @param {number} [amount = 5] The jokes amount
     * @param {string} [type = undefined] The jokes type
     * @returns {Joke[]} The jokes array
     */
    getRandomJokes(amount = 5, type) {
        const randomJokes = [];
        let jokesArray = [...jokes];
        let i = 0;

        if (type) jokesArray = this.#getJokesByType(type);

        while (i < amount) {
            const index = Math.floor(Math.random() * jokesArray.length);
            randomJokes.push(jokesArray[index]);
            i++;
        }

        return randomJokes;
    }

    /**
     * Gets the available joke types
     * @returns {string[]} The joke types array
     */
    getAvailableJokeTypes() {
        return jokes.reduce((accumulator, value) => {
            if (!accumulator.some(type => type === value.type)) accumulator.push(value.type);
            return accumulator;
        }, []);
    }

    /**
     * Get jokes by type
     * @param {string} type The jokes type
     * @returns {Joke[]} The jokes array
     */
    #getJokesByType(type) {
        return jokes.filter(joke => joke.type === type);
    }
}
