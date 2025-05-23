let currentSlide = 0;
let questions = [];

async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    questions = await res.json();
    console.log("Loaded questions:", questions);
    renderQuestionSlide(currentSlide, 4000); // example default fade duration for question slide
  } catch (err) {
    console.error("Error loading questions:", err);
  }
}

// Fit text inside a single button
function fitTextToButton(button, maxFontSize = 24, minFontSize = 10) {
  requestAnimationFrame(() => {
    let fontSize = maxFontSize;
    button.style.fontSize = fontSize + "px";

    const maxHeight = button.clientHeight;
    const maxWidth = button.clientWidth;

    while (
      (button.scrollHeight > maxHeight || button.scrollWidth > maxWidth) &&
      fontSize > minFontSize
    ) {
      fontSize--;
      button.style.fontSize = fontSize + "px";
    }
  });
}

// Fit text inside all answer buttons currently rendered
function fitAllButtonTexts() {
  document.querySelectorAll('button.answer').forEach(btn => {
    fitTextToButton(btn, 24, 10);
  });
}

// Render Question Slide with customizable fade duration
function renderQuestionSlide(index, fadeDuration = 2000) {
  const q = questions[index];
  const app = document.getElementById("quiz-container");

  const slide = document.createElement("div");
  slide.className = "slide fade";

  slide.innerHTML = `
  <div class="slide-inner">
    <h2>${q.question}</h2>
    <img src="${q.image}" class="question-image" alt="Question Image"/>
    <div class="button-container">
      ${q.choices.map(choice => `<button class="answer">${choice}</button>`).join("")}
    </div>
  </div>
  `;

  // Select all answer buttons
  const buttons = slide.querySelectorAll("button.answer");
  buttons.forEach(btn => {
    fitTextToButton(btn, 24, 10);
    btn.addEventListener("click", () => {
      const selected = btn.textContent.trim().charAt(0);
      handleAnswer(selected, index);
    });
  });

  fadeReplace(app, slide, fadeDuration);
}

// Handle answer click
function handleAnswer(selected, index) {
  console.log("Clicked choice:", selected, "for question index:", index);
  const q = questions[index];
  const isCorrect = selected === q.answer;
  showResultSlide(isCorrect, index, 1500);
}

// Show Result Slide with customizable fade duration
function showResultSlide(isCorrect, index) {
  const q = questions[index];
  const app = document.getElementById("quiz-container");

  const message = isCorrect ? "Correct!" : q.incorrectMessage || "Incorrect!";
  const slide = document.createElement("div");
  slide.className = "result-slide fade";
  slide.innerHTML = `<h1>${message}</h1>`;

  app.innerHTML = "";
  app.appendChild(slide);

  void slide.offsetWidth;
  slide.classList.add("active");

  const fadeInTime = 4000;
  const holdTime = 1000;

  setTimeout(() => {
    slide.classList.remove("active");

    setTimeout(() => {
      playVideoSlide(index, isCorrect);
    }, fadeInTime);
  }, fadeInTime + holdTime);
}

// Play Video Slide with customizable fade duration
function playVideoSlide(index, isCorrect) {
  const q = questions[index];
  const app = document.getElementById("quiz-container");
  const videoSrc = isCorrect ? q.videoCorrect : q.videoIncorrect;

  const fadeDuration = 4000;
  const fadeOutTimeBeforeEnd = 3500;

  const slide = document.createElement("div");
  slide.className = "slide fade";
  slide.innerHTML = `
    <video autoplay playsinline muted>
      <source src="${videoSrc}" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  `;

  app.innerHTML = "";
  app.appendChild(slide);

  void slide.offsetWidth;

  setTimeout(() => {
    slide.classList.add("active");
  }, 50);

  const video = slide.querySelector("video");
  video.muted = false;

  video.onloadedmetadata = () => {
    const fadeOutStart = Math.max(video.duration * 1000 - fadeOutTimeBeforeEnd, 0);

    setTimeout(() => {
      slide.classList.remove("active");
    }, fadeOutStart);

    setTimeout(() => {
      currentSlide++;
      if (currentSlide < questions.length) {
        renderQuestionSlide(currentSlide);
      } else {
        showFinalSlide();
      }
    }, fadeOutStart + fadeDuration);
  };
}

// Final slide
function showFinalSlide(fadeDuration = 3000) {
  const app = document.getElementById("quiz-container");
  const slide = document.createElement("div");
  slide.className = "slide fade";
  slide.innerHTML = `<h1>Quiz Completed! 🎉</h1>`;
  fadeReplace(app, slide, fadeDuration);
}

// Fade replace utility
function fadeReplace(container, newSlide, fadeDuration = 4000) {
  return new Promise((resolve) => {
    const oldSlide = container.querySelector(".slide, .result-slide");

    if (oldSlide) {
      oldSlide.classList.remove("active");

      setTimeout(() => {
        if (oldSlide.parentNode) {
          oldSlide.parentNode.removeChild(oldSlide);
        }

        container.appendChild(newSlide);
        void newSlide.offsetWidth;
        newSlide.classList.add("active");

        resolve();
      }, fadeDuration);
    } else {
      container.innerHTML = "";
      container.appendChild(newSlide);
      void newSlide.offsetWidth;
      newSlide.classList.add("active");
      resolve();
    }
  });
}

// Scale content container
function scaleContent() {
  const scaleContainer = document.getElementById('scale-container');
  const designWidth = 1280;
  const designHeight = 720;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / designWidth;
  const scaleY = windowHeight / designHeight;

  const scale = Math.min(scaleX, scaleY);
  scaleContainer.style.transform = `scale(${scale})`;
}


// **New:** Call fitAllButtonTexts() on window resize after scaling
window.addEventListener('resize', () => {
  scaleContent();
  fitAllButtonTexts();
});

// On load, scale content, load questions, then fit buttons text after a short delay
window.addEventListener('load', () => {
  scaleContent();
  loadQuestions();

  setTimeout(() => {
    fitAllButtonTexts();
  }, 100); // Slight delay to ensure buttons are rendered
});
