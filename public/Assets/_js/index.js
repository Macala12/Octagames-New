const gameNames = ["Subway Surfers !", "Call of duty mobile !", "Pie Attack !", "Monster Wants Candy !", "Basketball Hoop !"];
const gameNameElement = document.getElementById("gameName");

let gameIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeGameName() {
  const currentGame = gameNames[gameIndex];
  const displayedText = currentGame.substring(0, charIndex);
  gameNameElement.textContent = displayedText;

  if (!isDeleting && charIndex < currentGame.length) {
    charIndex++;
    setTimeout(typeGameName, 100); // typing speed
  } else if (isDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(typeGameName, 50); // deleting speed
  } else {
    // Switch from typing to deleting
    isDeleting = !isDeleting;

    if (!isDeleting) {
      // move to next game after finishing deleting
      gameIndex = (gameIndex + 1) % gameNames.length;
    }

    setTimeout(typeGameName, 1000); // pause before typing/deleting
  }
}
typeGameName();

const cards = document.querySelectorAll('.h_t_w_box');

function revealCards() {
  const triggerBottom = window.innerHeight * 0.9;

  cards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;

    if (cardTop < triggerBottom) {
      card.classList.add('show');
    }
  });
}
window.addEventListener('scroll', revealCards);
revealCards();

const textBlocks = document.querySelectorAll('.normal_text');

function slideText() {
  const triggerBottom = window.innerHeight * 0.9;

  textBlocks.forEach(block => {
    const blockTop = block.getBoundingClientRect().top;

    if (blockTop < triggerBottom) {
      block.classList.add('show');
    }
  });
}
window.addEventListener('scroll', slideText);
slideText();