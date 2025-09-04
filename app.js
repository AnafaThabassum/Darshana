// app.js — robust quiz + lesson flow suitable for GitHub Pages

document.addEventListener('DOMContentLoaded', () => {
  // ---------- state ----------
  const state = { xp: 0, level: 1 };

  // ---------- topics (teacher lesson + questions) ----------
  const topics = {
    photosynthesis: {
      title: "Photosynthesis",
      lesson: `Photosynthesis is the process by which plants use sunlight to produce food (glucose).
Plants take in carbon dioxide (CO₂) and water (H₂O), and using sunlight and chlorophyll, produce glucose and oxygen.`,
      questions: [
        { q: "Where does photosynthesis occur?", opts: ["Chloroplast", "Mitochondria", "Nucleus"], a: 0 },
        { q: "Which gas is released during photosynthesis?", opts: ["Oxygen", "Carbon dioxide", "Nitrogen"], a: 0 },
        { q: "What is the main product of photosynthesis?", opts: ["Protein", "Glucose", "Lipids"], a: 1 },
        { q: "Which pigment captures sunlight?", opts: ["Hemoglobin", "Chlorophyll", "Melanin"], a: 1 },
        { q: "Photosynthesis uses which energy source?", opts: ["Light energy", "Heat energy", "Kinetic energy"], a: 0 },
        { q: "Photosynthesis produces which by-product?", opts: ["O₂", "CO₂", "H₂"], a: 0 },
        { q: "Which organelle contains chlorophyll?", opts: ["Vacuole", "Chloroplast", "Golgi apparatus"], a: 1 },
        { q: "Equation uses CO₂ + H₂O to make?", opts: ["Salt", "Glucose", "Ammonia"], a: 1 }
      ]
    },

    electricity: {
      title: "Electricity Basics",
      lesson: `Electricity is the flow of electric charge (electrons). Basic terms:
Voltage (V) pushes current (I) through a circuit; Resistance (R) reduces current. Ohm's law: V = I × R.`,
      questions: [
        { q: "Unit of current?", opts: ["Volts", "Amps", "Ohms"], a: 1 },
        { q: "Unit of resistance?", opts: ["Ohm", "Amp", "Volt"], a: 0 },
        { q: "Ohm's law is:", opts: ["V = I × R", "P = V × I", "E = mc²"], a: 0 },
        { q: "Current flows due to:", opts: ["Pressure", "Voltage difference", "Mass"], a: 1 },
        { q: "Series circuit has:", opts: ["Multiple paths", "Single path", "No path"], a: 1 },
        { q: "Parallel circuit has:", opts: ["Single path", "Multiple paths", "No path"], a: 1 }
      ]
    },

    titration: {
      title: "Titration (Demo)",
      lesson: `Titration is used to find concentration by slowly adding a titrant to an analyte until a reaction completes (indicator changes color). This demo lets you vary drops.`,
      questions: [
        { q: "Titration often uses an indicator to show:", opts: ["pH change", "Temperature", "Pressure"], a: 0 },
        { q: "When endpoint is reached the color:", opts: ["May change", "Stays same", "Explodes"], a: 0 },
        { q: "Titration finds:", opts: ["Mass", "Concentration", "Volume only"], a: 1 }
      ]
    }
  };

  // ---------- DOM refs ----------
  const moduleArea = document.getElementById('moduleArea');
  const xpEl = document.getElementById('xp');
  const levelEl = document.getElementById('level');
  const avgEngEl = document.getElementById('avgEng');

  // ---------- utils ----------
  function updateXPDisplay() {
    xpEl.textContent = state.xp;
    levelEl.textContent = state.level;
  }
  function addXP(amount) {
    state.xp += amount;
    // level up every 100 XP
    while (state.xp >= state.level * 100) {
      state.xp -= state.level * 100;
      state.level++;
    }
    updateXPDisplay();
  }

  // ---------- module selection ----------
  document.querySelectorAll('#moduleTiles .tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const topicKey = btn.dataset.topic;
      if (!topics[topicKey]) {
        moduleArea.innerHTML = `<p>Topic not found.</p>`;
        return;
      }
      showLesson(topicKey);
    });
  });

  // ---------- show lesson ----------
  function showLesson(topicKey) {
    const topic = topics[topicKey];
    moduleArea.innerHTML = `
      <h3>${topic.title} — Lesson</h3>
      <p>${topic.lesson}</p>
      <div style="margin-top:8px">
        <button id="startQuizBtn" class="option-btn">Start Quiz on "${topic.title}"</button>
      </div>
    `;
    document.getElementById('startQuizBtn').addEventListener('click', () => startQuiz(topicKey));
  }

  // ---------- Quiz flow ----------
  function startQuiz(topicKey) {
    const topic = topics[topicKey];
    const questions = [...topic.questions]; // copy
    let index = 0;
    let correctCount = 0;
    let earnedXP = 0;

    // show first question
    renderQuestion();

    function renderQuestion() {
      moduleArea.innerHTML = `<h3>${topic.title} — Quiz</h3>
        <div id="questionArea"></div>
        <div id="feedbackArea"></div>
        <div id="progressArea" class="small" style="margin-top:8px"></div>
      `;
      const questionArea = document.getElementById('questionArea');
      const cur = questions[index];
      questionArea.innerHTML = `<strong>Q${index + 1}. ${cur.q}</strong><div style="margin-top:8px" id="options"></div>`;
      const optionsEl = document.getElementById('options');

      cur.opts.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'option-btn';
        b.textContent = opt;
        b.addEventListener('click', () => handleAnswer(i, b));
        optionsEl.appendChild(b);
      });

      document.getElementById('progressArea').textContent = `Question ${index + 1} of ${questions.length}`;
    }

    function handleAnswer(choiceIndex, buttonEl) {
      // disable all option buttons
      const opts = moduleArea.querySelectorAll('.option-btn');
      opts.forEach(b => b.disabled = true);

      const cur = questions[index];
      const feedbackArea = document.getElementById('feedbackArea');

      if (choiceIndex === cur.a) {
        // correct
        addXP(30);
        earnedXP += 30;
        correctCount++;
        feedbackArea.innerHTML = `<div class="feedback correct">✅ Correct! +30 XP</div>`;
      } else {
        // wrong — show correct answer
        const correctText = cur.opts[cur.a];
        feedbackArea.innerHTML = `<div class="feedback wrong">❌ Wrong — correct: <strong>${correctText}</strong></div>`;
      }

      // auto-move to next after short delay
      setTimeout(() => {
        index++;
        if (index < questions.length) {
          renderQuestion();
        } else {
          finishQuiz();
        }
      }, 900); // 900ms delay so student sees feedback
    }

    function finishQuiz() {
      // optional completion bonus
      const bonus = 50;
      addXP(bonus);

      moduleArea.innerHTML = `
        <h3>Quiz Complete 🎉</h3>
        <div class="summary">
          <p>Topic: <strong>${topic.title}</strong></p>
          <p>Correct Answers: <strong>${correctCount} / ${questions.length}</strong></p>
          <p>Points earned this quiz: <strong>${earnedXP}</strong></p>
          <p>Completion bonus: <strong>${bonus}</strong></p>
        </div>
        <div style="margin-top:10px">
          <button id="backToLesson" class="option-btn">Back to Lesson</button>
          <button id="takeAgain" class="option-btn">Retake Quiz</button>
        </div>
      `;

      document.getElementById('backToLesson').addEventListener('click', () => showLesson(topicKey));
      document.getElementById('takeAgain').addEventListener('click', () => startQuiz(topicKey));
    }
  }

  // ---------- demo analytics updater ----------
  setInterval(() => {
    // simple simulated engagement value
    avgEngEl.textContent = Math.min(100, Math.floor((state.xp / 400) * 100));
  }, 1000);

  // initial update
  updateXPDisplay();
});
