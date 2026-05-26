// Вопросы для квиза
const questions = [
    {
        text: "Как называется первая опубликованная книга Стивена Кинга?",
        answers: ["Сияние", "Кэрри", "Оно", "Мизери"],
        correct: 1
    },
    {
        text: "Под каким псевдонимом Стивен Кинг публиковал свои ранние произведения?",
        answers: ["Марк Твен", "Ричард Бахман", "Джордж Оруэлл", "Стивен Браун"],
        correct: 1
    },
    {
        text: "Какой роман Стивена Кинга был вдохновлён страхом перед клоунами?",
        answers: ["Сияние", "Кладбище домашних животных", "Оно", "Зелёная миля"],
        correct: 2
    },
    {
        text: "В каком году Кинг попал в серьёзную автомобильную аварию?",
        answers: ["1997", "1998", "1999", "2000"],
        correct: 2
    },
    {
        text: "Сколько слов в день пишет Стивен Кинг по своей привычке?",
        answers: ["1000 слов", "2000 слов", "3000 слов", "5000 слов"],
        correct: 1
    },
    {
        text: "Кто спас черновик «Кэрри» из мусорной корзины?",
        answers: ["Мать Кинга", "Жена Табита", "Издатель", "Агент Кинга"],
        correct: 1
    },
    {
        text: "Как называется смертный блок в романе «Зелёная миля»?",
        answers: ["Холодная миля", "Зелёная миля", "Тёмная миля", "Последняя миля"],
        correct: 1
    },
    {
        text: "Какой известный режиссёр снял фильм «Сияние» по роману Кинга?",
        answers: ["Альфред Хичкок", "Стэнли Кубрик", "Квентин Тарантино", "Мартин Скорсезе"],
        correct: 1
    },
    {
        text: "Сколько экранизаций произведений Стивена Кинга существует примерно?",
        answers: ["Более 30", "Более 50", "Более 100", "Более 200"],
        correct: 2
    },
    {
        text: "Какой роман Кинга считается самым длинным по количеству страниц?",
        answers: ["Сияние", "Противостояние", "Оно", "Тёмная башня"],
        correct: 2
    }
];

// Переменные состояния
let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null);
let score = 0;
let quizCompleted = false;

// DOM элементы
const questionText = document.getElementById('question-text');
const answersGrid = document.getElementById('answers-grid');
const nextBtn = document.getElementById('next-btn');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const currentScoreSpan = document.getElementById('current-score');
const progressFill = document.getElementById('progress-fill');
const quizCard = document.getElementById('quiz-card');
const resultsCard = document.getElementById('results-card');
const quizButtons = document.getElementById('quiz-buttons');

// Инициализация
function initQuiz() {
    totalQuestionsSpan.textContent = questions.length;
    currentQuestionSpan.textContent = '1';
    currentScoreSpan.textContent = '0';
    loadQuestion();
    updateProgress();
    updateNextButtonState();
    updateBackButtonVisibility(); // Обновляем видимость кнопки "Назад"
}

// Обновление видимости кнопки "Назад"
function updateBackButtonVisibility() {
    // Удаляем существующую кнопку "Назад", если она есть
    const existingPrevBtn = document.querySelector('.prev-btn');
    if (existingPrevBtn) {
        existingPrevBtn.remove();
    }
    
    // Если это не первый вопрос, добавляем кнопку "Назад"
    if (currentQuestionIndex > 0 && !quizCompleted) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn prev-btn';
        prevBtn.id = 'prev-btn';
        prevBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Назад';
        prevBtn.addEventListener('click', prevQuestion);
        
        // Вставляем кнопку "Назад" в начало контейнера
        quizButtons.insertBefore(prevBtn, nextBtn);
    }
}

// Загрузка вопроса
function loadQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.text;
    
    // Очищаем сетку ответов
    answersGrid.innerHTML = '';
    
    // Создаем кнопки ответов
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        
        const letter = String.fromCharCode(65 + index);
        button.innerHTML = `
            <div class="answer-letter">${letter}</div>
            <div class="answer-text">${answer}</div>
            <div class="answer-icon"></div>
        `;
        
        // Если ответ уже выбран для этого вопроса, отмечаем его
        const savedAnswer = userAnswers[currentQuestionIndex];
        if (savedAnswer !== null && savedAnswer === index) {
            button.classList.add('selected');
            button.innerHTML = `
                <div class="answer-letter">${letter}</div>
                <div class="answer-text">${answer}</div>
                <div class="answer-icon"><i class="fas fa-check-circle"></i></div>
            `;
        }
        
        button.addEventListener('click', () => onAnswerClick(index));
        answersGrid.appendChild(button);
    });
    
    // Обновляем номер вопроса
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    updateProgress();
    updateNextButtonState();
    updateBackButtonVisibility(); // Обновляем видимость кнопки "Назад" при смене вопроса
}

// Обновление состояния кнопки "Далее"
function updateNextButtonState() {
    const hasAnswer = userAnswers[currentQuestionIndex] !== null;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    if (isLastQuestion && !quizCompleted) {
        const allAnswered = userAnswers.every(answer => answer !== null);
        if (allAnswered) {
            nextBtn.disabled = false;
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Завершить';
            nextBtn.style.background = '#28a745';
            nextBtn.style.opacity = '1';
        } else {
            nextBtn.disabled = true;
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Завершить';
            nextBtn.style.background = '#6c757d';
            nextBtn.style.opacity = '0.6';
        }
    } else {
        if (hasAnswer) {
            nextBtn.disabled = false;
            nextBtn.innerHTML = 'Далее <i class="fas fa-arrow-right"></i>';
            nextBtn.style.background = '';
            nextBtn.style.opacity = '1';
        } else {
            nextBtn.disabled = true;
            nextBtn.innerHTML = 'Далее <i class="fas fa-arrow-right"></i>';
            nextBtn.style.background = '#6c757d';
            nextBtn.style.opacity = '0.6';
        }
    }
}

// Обработчик клика по ответу
function onAnswerClick(answerIndex) {
    if (quizCompleted) return;
    
    // Сохраняем ответ
    userAnswers[currentQuestionIndex] = answerIndex;
    
    // Обновляем отображение ответов для текущего вопроса
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach((btn, idx) => {
        if (idx === answerIndex) {
            btn.classList.add('selected');
            btn.innerHTML = `
                <div class="answer-letter">${String.fromCharCode(65 + idx)}</div>
                <div class="answer-text">${questions[currentQuestionIndex].answers[idx]}</div>
                <div class="answer-icon"><i class="fas fa-check-circle"></i></div>
            `;
        } else if (userAnswers[currentQuestionIndex] !== idx) {
            btn.classList.remove('selected');
            btn.innerHTML = `
                <div class="answer-letter">${String.fromCharCode(65 + idx)}</div>
                <div class="answer-text">${questions[currentQuestionIndex].answers[idx]}</div>
                <div class="answer-icon"></div>
            `;
        }
    });
    
    // Обновляем состояние кнопки "Далее"
    updateNextButtonState();
}

// Обновление прогресс-бара
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

// Следующий вопрос
function nextQuestion() {
    if (quizCompleted) return;
    
    // Проверяем, есть ли ответ на текущий вопрос
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Пожалуйста, выберите ответ перед переходом к следующему вопросу!');
        return;
    }
    
    if (currentQuestionIndex === questions.length - 1) {
        // Проверяем, все ли вопросы отвечены
        const allAnswered = userAnswers.every(answer => answer !== null);
        if (allAnswered) {
            completeQuiz();
        } else {
            alert('Пожалуйста, ответьте на все вопросы перед завершением!');
        }
    } else {
        currentQuestionIndex++;
        loadQuestion();
    }
}

// Предыдущий вопрос
function prevQuestion() {
    if (quizCompleted) return;
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Завершение квиза
function completeQuiz() {
    // Вычисляем результат
    score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] !== null && userAnswers[i] === questions[i].correct) {
            score++;
        }
    }
    
    quizCompleted = true;
    
    // Переключаемся на карточку результатов
    quizCard.style.display = 'none';
    resultsCard.style.display = 'block';
    
    // Отображаем результат
    const finalScore = score;
    const totalQuestions = questions.length;
    const percentage = (finalScore / totalQuestions) * 100;
    
    document.getElementById('final-score').textContent = finalScore;
    
    let message = '';
    if (percentage === 100) {
        message = '🎉 Потрясающе! Вы настоящий эксперт по творчеству Стивена Кинга! 🎉';
    } else if (percentage >= 80) {
        message = '📚 Отлично! Вы очень хорошо знаете Короля ужасов! 📚';
    } else if (percentage >= 60) {
        message = '👍 Хороший результат! Но есть куда расти. Попробуйте пройти квиз ещё раз! 👍';
    } else if (percentage >= 40) {
        message = '📖 Неплохо, но стоит больше читать книги Стивена Кинга. 📖';
    } else {
        message = '😱 Ого! Похоже, вы совсем не знакомы с творчеством Кинга. Самое время начать читать его книги! 😱';
    }
    
    document.getElementById('result-message').textContent = message;
    
    // Показываем детали ответов
    const resultsDetails = document.getElementById('results-details');
    resultsDetails.innerHTML = '<h4><i class="fas fa-list"></i> Детали ответов:</h4>';
    
    questions.forEach((q, idx) => {
        const userAnswer = userAnswers[idx];
        const isCorrect = (userAnswer === q.correct);
        const userAnswerText = userAnswer !== null ? q.answers[userAnswer] : 'Не отвечен';
        const correctAnswerText = q.answers[q.correct];
        
        const p = document.createElement('p');
        p.innerHTML = `<strong>${idx + 1}.</strong> ${q.text}<br>
                       <span style="color: ${isCorrect ? '#28a745' : '#dc3545'}">
                           <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                           Ваш ответ: ${userAnswerText}
                       </span><br>
                       <span style="color: #28a745">
                           <i class="fas fa-check"></i> Правильный ответ: ${correctAnswerText}
                       </span>`;
        resultsDetails.appendChild(p);
    });
    
    currentScoreSpan.textContent = score;
}

// Перезапуск квиза
function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    score = 0;
    quizCompleted = false;
    
    currentScoreSpan.textContent = '0';
    
    quizCard.style.display = 'block';
    resultsCard.style.display = 'none';
    
    loadQuestion();
    updateProgress();
    updateNextButtonState();
    updateBackButtonVisibility();
}

// Переход в галерею
function goToGallery() {
    window.location.href = 'gallery.html';
}

// Обработчики событий
nextBtn.addEventListener('click', nextQuestion);
document.getElementById('restart-btn').addEventListener('click', restartQuiz);
document.getElementById('gallery-btn').addEventListener('click', goToGallery);

// Запуск квиза
initQuiz();