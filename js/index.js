import GameService from './services/game.service.js';

const gameService = new GameService();
const startButton = document.querySelector('#start-button');

startButton.addEventListener('click', () => gameService.init());
