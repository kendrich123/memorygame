const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win'),
    playAgainBtn: document.querySelector('.play-again-btn'),
    difficultySelect: document.getElementById('difficulty'),
    
};

const state = {
    gameStarted: false,
    initialReveal: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null,
};

const shuffle = array => {
    const clonedArray = [...array];

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = clonedArray[i];

        clonedArray[i] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }

    return clonedArray;
};

const stopGame = () => {
    clearInterval(state.loop);
    selectors.playAgainBtn.style.display = 'block'; // Show the Play Again button
};

const playAgain = () => {
    selectors.boardContainer.classList.remove('flipped');
    selectors.start.classList.remove('disabled');
    state.gameStarted = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;
    selectors.moves.innerText = `${state.totalFlips} moves`;
    selectors.timer.innerText = `Time: ${state.totalTime} sec`;

    // Show the reminder text when playing again
    const reminderText = document.getElementById('reminder-text');
    reminderText.classList.remove('hidden');

    selectors.playAgainBtn.style.display = 'none';
    stopWinnerAudio();
    generateGame();
    attachEventListeners();
};

const revealCardsBeforeStart = () => {
    // If cards have already been revealed, do nothing
    if (state.initialReveal) {
        return;
    }

    const cards = document.querySelectorAll('.card');
    let revealTime;

    switch (selectors.difficultySelect.value) {
        case "4": // Easy level
            revealTime = 1500; // 10 seconds
            break;
        case "6": // Medium level
            revealTime = 2500; // 20 seconds
            break;
        case "8": // Hard level
            revealTime = 5000; // 40 seconds
            break;
        default:
            revealTime = 1000; // Default to 1 second for other cases
    }

    cards.forEach(card => {
        card.classList.add('flipped');
    });

    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('flipped');
        });

        state.initialReveal = true; // Set the flag to true after the initial reveal
        startGame(); // Now, start the game
    }, revealTime);
};


const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);

        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }

    return randomPicks;
};

const generateGame = () => {
    const dimensions = selectors.difficultySelect.value;
    const emojis = ['😇', '😎', '😌', '😭', '🙄', '😚', '😝', '😁', '😱', '🤑', '🤡', '💩', '😡', '🎃', '🤙🏻', '🤭', '🤪', '👩‍💻','🤟', '👊', '👋', '☂️',
        '🧶', '👘','👑','🥻', '👨🏻‍🌾', '👩🏻‍🎓', '👨🏻‍🎓', '🐶', '🐼', '🐸'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);

    const cards = `
        <div class="board" data-dimension="${dimensions}" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
        </div>
    `;

    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.boardContainer.replaceChild(parser.querySelector('.board'), selectors.boardContainer.querySelector('.board'));
};
const hideReminderText = () => {
    const reminderText = document.getElementById('reminder-text');
    reminderText.classList.add('hidden');
};

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    hideReminderText(); // Call the function to hide the reminder text

    clearInterval(state.loop);

    state.loop = setInterval(() => {
        state.totalTime++;

        selectors.moves.innerText = `${state.totalFlips} moves`;
        selectors.timer.innerText = `Time: ${state.totalTime} sec`;
    }, 1000);
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });

    state.flippedCards = 0;
};

const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');

        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
            playSuccessAudio(); // Play success audio
        } else {
            playFailAudio(); // Play fail audio
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;
	    playWinnerAudio(); // Play winner audio
            clearInterval(state.loop);
	    stopGame();
        }, 1000);
    }
};


// Add these functions to play success and fail audio
const playSuccessAudio = () => {
    const successAudio = document.getElementById('success');
    successAudio.play();
};

const playFailAudio = () => {
    const failAudio = document.getElementById('fail');
    failAudio.play();
};

const playWinnerAudio = () => {
    const winnerAudio = document.getElementById('winner');
    winnerAudio.play();

    // Display the confetti GIF when the player wins
    const confettiGif = document.querySelector('.confetti-gif');
    confettiGif.style.display = 'block';
};

const stopWinnerAudio = () => {
    const winnerAudio = document.getElementById('winner');
    winnerAudio.pause(); // Pause the audio if it's playing

    // Hide the confetti GIF
    const confettiGif = document.querySelector('.confetti-gif');
    confettiGif.style.display = 'none';
};

const attachEventListeners = () => {
    selectors.difficultySelect.addEventListener('change', generateGame);

    selectors.playAgainBtn.addEventListener('click', () => {
        playAgain();
    });
    selectors.start.addEventListener('click', () => {
	if (!state.gameStarted) {
	state.initialReveal = false;
	startGame();
        revealCardsBeforeStart();
	}
    });


    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (!state.initialReveal && eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            revealCardsBeforeStart();
        } else if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent);
        } else if (state.gameStarted && eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame();
        } else if (eventTarget.className.includes('play-again-btn')) {
            playAgain();
        }
    });
};

const initGame = () => {
    generateGame();
    attachEventListeners();
};

initGame();