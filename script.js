// ============================================================
// 1. API Configuration
// ============================================================
const jokeApiUrl = 'https://v2.jokeapi.dev/joke/Any?type=single&safe-mode';
const quoteApiUrl = 'https://quotable-hub.vercel.app/quotes/random?limit=1';
const dogApiUrl = 'https://dog.ceo/api/breeds/image/random';

// ============================================================
// 2. EXPANDED Category & Item Definitions
// ============================================================
const categoryMap = {
    // ----- ANIMALS (EXPANDED) -----
    animals: {
        label: '🐾 Animals',
        colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF9FF3', '#FF9F43'],
        apiFetch: async (item) => {
            if (item === 'dog') {
                const res = await fetch(dogApiUrl);
                const data = await res.json();
                return { image: data.message };
            }
            if (item === 'cat') {
                try {
                    const res = await fetch('https://catfact.ninja/fact');
                    const data = await res.json();
                    return { fact: data.fact };
                } catch { return {}; }
            }
            return {};
        },
        items: {
            dog: { label: 'Dog', emoji: '🐶', color: '#FF6B6B' },
            cat: { label: 'Cat', emoji: '🐱', color: '#FFD93D' },
            horse: { label: 'Horse', emoji: '🐴', color: '#6BCB77' },
            rabbit: { label: 'Rabbit', emoji: '🐰', color: '#FF9FF3' },
            fox: { label: 'Fox', emoji: '🦊', color: '#FF9F43' },
            panda: { label: 'Panda', emoji: '🐼', color: '#4D96FF' },
            koala: { label: 'Koala', emoji: '🐨', color: '#6BCB77' },
            tiger: { label: 'Tiger', emoji: '🐯', color: '#FF9F43' },
            lion: { label: 'Lion', emoji: '🦁', color: '#FFD93D' },
            monkey: { label: 'Monkey', emoji: '🐒', color: '#FF9FF3' },
            elephant: { label: 'Elephant', emoji: '🐘', color: '#6BCB77' },
            penguin: { label: 'Penguin', emoji: '🐧', color: '#4D96FF' },
        }
    },
    
    // ----- FRUITS (EXPANDED) -----
    fruits: {
        label: '🍎 Fruits',
        colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#FF9F43', '#FF9FF3', '#4D96FF'],
        apiFetch: async (item) => { return {}; },
        items: {
            banana: { label: 'Banana', emoji: '🍌', color: '#FFD93D' },
            apple: { label: 'Apple', emoji: '🍎', color: '#FF6B6B' },
            orange: { label: 'Orange', emoji: '🍊', color: '#FF9F43' },
            strawberry: { label: 'Strawberry', emoji: '🍓', color: '#FF6B6B' },
            watermelon: { label: 'Watermelon', emoji: '🍉', color: '#6BCB77' },
            mango: { label: 'Mango', emoji: '🥭', color: '#FFD93D' },
            pineapple: { label: 'Pineapple', emoji: '🍍', color: '#FFD93D' },
            grapes: { label: 'Grapes', emoji: '🍇', color: '#9B59B6' },
            peach: { label: 'Peach', emoji: '🍑', color: '#FF9FF3' },
            kiwi: { label: 'Kiwi', emoji: '🥝', color: '#6BCB77' },
            lemon: { label: 'Lemon', emoji: '🍋', color: '#FFD93D' },
            coconut: { label: 'Coconut', emoji: '🥥', color: '#8B7355' },
        }
    },
    
    // ----- FOOD (EXPANDED) -----
    food: {
        label: '🍕 Food',
        colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#D4A574', '#FF9F43', '#FF9FF3'],
        apiFetch: async (item) => { return {}; },
        items: {
            potato: { label: 'Potato', emoji: '🥔', color: '#D4A574' },
            pizza: { label: 'Pizza', emoji: '🍕', color: '#FF6B6B' },
            burger: { label: 'Burger', emoji: '🍔', color: '#D4A574' },
            taco: { label: 'Taco', emoji: '🌮', color: '#FFD93D' },
            bread: { label: 'Bread', emoji: '🍞', color: '#D4A574' },
            sushi: { label: 'Sushi', emoji: '🍣', color: '#FF9FF3' },
            pasta: { label: 'Pasta', emoji: '🍝', color: '#FFD93D' },
            pancake: { label: 'Pancake', emoji: '🥞', color: '#FF9F43' },
            egg: { label: 'Egg', emoji: '🥚', color: '#FFD93D' },
            cheese: { label: 'Cheese', emoji: '🧀', color: '#FFD93D' },
            donut: { label: 'Donut', emoji: '🍩', color: '#FF9FF3' },
            cookie: { label: 'Cookie', emoji: '🍪', color: '#D4A574' },
        }
    },
    
    // ----- NEW: VEGETABLES -----
    vegetables: {
        label: '🥬 Vegetables',
        colors: ['#6BCB77', '#FF6B6B', '#FFD93D', '#4D96FF', '#FF9F43', '#FF9FF3'],
        apiFetch: async (item) => { return {}; },
        items: {
            carrot: { label: 'Carrot', emoji: '🥕', color: '#FF9F43' },
            broccoli: { label: 'Broccoli', emoji: '🥦', color: '#6BCB77' },
            corn: { label: 'Corn', emoji: '🌽', color: '#FFD93D' },
            tomato: { label: 'Tomato', emoji: '🍅', color: '#FF6B6B' },
            cucumber: { label: 'Cucumber', emoji: '🥒', color: '#6BCB77' },
            mushroom: { label: 'Mushroom', emoji: '🍄', color: '#D4A574' },
            pepper: { label: 'Bell Pepper', emoji: '🫑', color: '#FF6B6B' },
            chili: { label: 'Chili Pepper', emoji: '🌶️', color: '#FF6B6B' },
            pumpkin: { label: 'Pumpkin', emoji: '🎃', color: '#FF9F43' },
            garlic: { label: 'Garlic', emoji: '🧄', color: '#D4A574' },
            onion: { label: 'Onion', emoji: '🧅', color: '#D4A574' },
            avocado: { label: 'Avocado', emoji: '🥑', color: '#6BCB77' },
        }
    },
    
    // ----- NEW: DRINKS -----
    drinks: {
        label: '☕ Drinks',
        colors: ['#4D96FF', '#FFD93D', '#FF6B6B', '#FF9FF3', '#6BCB77', '#D4A574'],
        apiFetch: async (item) => { return {}; },
        items: {
            coffee: { label: 'Coffee', emoji: '☕', color: '#6B4226' },
            tea: { label: 'Tea', emoji: '🍵', color: '#6BCB77' },
            soda: { label: 'Soda', emoji: '🥤', color: '#4D96FF' },
            juice: { label: 'Juice', emoji: '🧃', color: '#FF9F43' },
            milk: { label: 'Milk', emoji: '🥛', color: '#D4A574' },
            beer: { label: 'Beer', emoji: '🍺', color: '#FFD93D' },
            wine: { label: 'Wine', emoji: '🍷', color: '#FF6B6B' },
            cocktail: { label: 'Cocktail', emoji: '🍸', color: '#FF9FF3' },
            shake: { label: 'Milkshake', emoji: '🥤', color: '#FF9FF3' },
            coffee_cup: { label: 'Coffee Cup', emoji: '☕', color: '#6B4226' },
        }
    },
    
    // ----- NEW: DESSERTS -----
    desserts: {
        label: '🍰 Desserts',
        colors: ['#FF9FF3', '#FFD93D', '#FF6B6B', '#6BCB77', '#FF9F43', '#4D96FF'],
        apiFetch: async (item) => { return {}; },
        items: {
            cake: { label: 'Cake', emoji: '🎂', color: '#FF9FF3' },
            cupcake: { label: 'Cupcake', emoji: '🧁', color: '#FF9FF3' },
            ice_cream: { label: 'Ice Cream', emoji: '🍦', color: '#FFD93D' },
            chocolate: { label: 'Chocolate', emoji: '🍫', color: '#6B4226' },
            candy: { label: 'Candy', emoji: '🍬', color: '#FF6B6B' },
            lollipop: { label: 'Lollipop', emoji: '🍭', color: '#FF9FF3' },
            pie: { label: 'Pie', emoji: '🥧', color: '#FFD93D' },
            pudding: { label: 'Pudding', emoji: '🍮', color: '#FFD93D' },
            popsicle: { label: 'Popsicle', emoji: '🍧', color: '#FF6B6B' },
        }
    },
    
    // ----- NEW: BIRDS -----
    birds: {
        label: '🐦 Birds',
        colors: ['#4D96FF', '#FFD93D', '#FF6B6B', '#6BCB77', '#FF9F43', '#FF9FF3'],
        apiFetch: async (item) => { return {}; },
        items: {
            owl: { label: 'Owl', emoji: '🦉', color: '#D4A574' },
            eagle: { label: 'Eagle', emoji: '🦅', color: '#6B4226' },
            duck: { label: 'Duck', emoji: '🦆', color: '#FFD93D' },
            chicken: { label: 'Chicken', emoji: '🐔', color: '#FFD93D' },
            penguin_bird: { label: 'Penguin', emoji: '🐧', color: '#4D96FF' },
            parrot: { label: 'Parrot', emoji: '🦜', color: '#FF6B6B' },
            pigeon: { label: 'Pigeon', emoji: '🕊️', color: '#D4A574' },
            flamingo: { label: 'Flamingo', emoji: '🦩', color: '#FF9FF3' },
            peacock: { label: 'Peacock', emoji: '🦚', color: '#4D96FF' },
            swan: { label: 'Swan', emoji: '🦢', color: '#D4A574' },
            rooster: { label: 'Rooster', emoji: '🐓', color: '#FF6B6B' },
        }
    },
    
    // ----- NEW: SEA CREATURES -----
    sea: {
        label: '🐠 Sea Creatures',
        colors: ['#4D96FF', '#6BCB77', '#FFD93D', '#FF6B6B', '#FF9F43', '#FF9FF3'],
        apiFetch: async (item) => { return {}; },
        items: {
            fish: { label: 'Fish', emoji: '🐟', color: '#4D96FF' },
            shark: { label: 'Shark', emoji: '🦈', color: '#4D96FF' },
            octopus: { label: 'Octopus', emoji: '🐙', color: '#FF6B6B' },
            whale: { label: 'Whale', emoji: '🐋', color: '#4D96FF' },
            dolphin: { label: 'Dolphin', emoji: '🐬', color: '#4D96FF' },
            crab: { label: 'Crab', emoji: '🦀', color: '#FF6B6B' },
            lobster: { label: 'Lobster', emoji: '🦞', color: '#FF6B6B' },
            snail: { label: 'Snail', emoji: '🐌', color: '#D4A574' },
            turtle: { label: 'Turtle', emoji: '🐢', color: '#6BCB77' },
            frog: { label: 'Frog', emoji: '🐸', color: '#6BCB77' },
            crocodile: { label: 'Crocodile', emoji: '🐊', color: '#6BCB77' },
        }
    },
};

// ============================================================
// 3. DOM References
// ============================================================
const categorySelect = document.getElementById('categorySelect');
const itemSelect = document.getElementById('itemSelect');
const form = document.getElementById('generatorForm');
const resultContent = document.getElementById('resultContent');
const generateBtn = document.getElementById('generateBtn');
const randomBtn = document.getElementById('randomBtn');

// ============================================================
// 4. Voiceover System
// ============================================================
let currentUtterance = null;
let isPlaying = false;
let lastCharacterName = '';
let lastQuoteText = '';
let lastJokeText = '';

function speakCharacter(name, quote, joke) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (!window.speechSynthesis) return;

    let cleanJoke = joke;
    if (cleanJoke.startsWith('"') && cleanJoke.endsWith('"')) {
        cleanJoke = cleanJoke.slice(1, -1);
    }

    const message = `Introducing... ${name}! ${quote} Also said: ${cleanJoke}`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const irishVoice = voices.find(v => v.lang.includes('en-IE'));
    const englishVoice = voices.find(v => v.lang.includes('en-GB'));
    if (irishVoice) utterance.voice = irishVoice;
    else if (englishVoice) utterance.voice = englishVoice;

    currentUtterance = utterance;
    isPlaying = true;
    updateVoiceButtons(true);
    startCartoonSpeaking();

    utterance.onend = () => {
        isPlaying = false;
        updateVoiceButtons(false);
        currentUtterance = null;
        stopCartoonSpeaking();
    };

    utterance.onerror = () => {
        isPlaying = false;
        updateVoiceButtons(false);
        currentUtterance = null;
        stopCartoonSpeaking();
    };

    window.speechSynthesis.speak(utterance);
}

function stopVoice() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    isPlaying = false;
    currentUtterance = null;
    updateVoiceButtons(false);
    stopCartoonSpeaking();
}

function replayVoice() {
    stopVoice();
    setTimeout(() => {
        speakCharacter(lastCharacterName, lastQuoteText, lastJokeText);
    }, 200);
}

function updateVoiceButtons(isPlaying) {
    const playBtn = document.getElementById('playVoiceBtn');
    const stopBtn = document.getElementById('stopVoiceBtn');
    if (playBtn) {
        playBtn.disabled = isPlaying;
        playBtn.innerHTML = isPlaying ? '🔊 Speaking...' : '🔊 Play Voice';
        if (isPlaying) playBtn.classList.add('playing');
        else playBtn.classList.remove('playing');
    }
    if (stopBtn) stopBtn.disabled = !isPlaying;
}

// ============================================================
// 5. Cartoon Speaking Animation
// ============================================================
let speakingInterval = null;

function startCartoonSpeaking() {
    const character = document.getElementById('cartoonCharacter');
    const eyes = document.getElementById('characterEyes');
    const eyebrows = document.getElementById('characterEyebrows');
    const mouth = document.getElementById('characterMouth');
    const bubble = document.getElementById('speechBubble');
    const waves = document.querySelectorAll('.sound-wave');

    if (character) character.classList.add('speaking');
    if (eyes) eyes.classList.add('speaking');
    if (eyebrows) eyebrows.classList.add('speaking');
    if (mouth) mouth.classList.add('speaking');
    if (bubble) bubble.classList.add('show');

    waves.forEach((wave, index) => {
        setTimeout(() => wave.classList.add('active'), index * 200);
    });

    let mouthOpen = true;
    speakingInterval = setInterval(() => {
        if (mouth) {
            mouthOpen = !mouthOpen;
            if (mouthOpen) {
                mouth.style.height = '20px';
                mouth.style.borderRadius = '0 0 50% 50%';
                mouth.style.transform = 'scaleX(1.2)';
            } else {
                mouth.style.height = '4px';
                mouth.style.borderRadius = '50%';
                mouth.style.transform = 'scaleX(0.8)';
            }
        }
    }, 200);
}

function stopCartoonSpeaking() {
    const character = document.getElementById('cartoonCharacter');
    const eyes = document.getElementById('characterEyes');
    const eyebrows = document.getElementById('characterEyebrows');
    const mouth = document.getElementById('characterMouth');
    const bubble = document.getElementById('speechBubble');
    const waves = document.querySelectorAll('.sound-wave');

    if (character) character.classList.remove('speaking');
    if (eyes) eyes.classList.remove('speaking');
    if (eyebrows) eyebrows.classList.remove('speaking');
    if (mouth) {
        mouth.classList.remove('speaking');
        mouth.style.height = '8px';
        mouth.style.borderRadius = '50%';
        mouth.style.transform = 'scaleX(1)';
    }
    if (bubble) bubble.classList.remove('show');

    waves.forEach(wave => wave.classList.remove('active'));

    if (speakingInterval) {
        clearInterval(speakingInterval);
        speakingInterval = null;
    }
}

// ============================================================
// 6. Populate Dropdowns
// ============================================================
function populateCategories() {
    categorySelect.innerHTML = '<option value="">— Select —</option>';
    for (const [key, value] of Object.entries(categoryMap)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value.label;
        categorySelect.appendChild(option);
    }
}
populateCategories();

categorySelect.addEventListener('change', function() {
    const categoryKey = this.value;
    itemSelect.innerHTML = '<option value="">— Choose an item —</option>';
    if (!categoryKey || !categoryMap[categoryKey]) return;

    const items = categoryMap[categoryKey].items;
    for (const [itemKey, itemValue] of Object.entries(items)) {
        const option = document.createElement('option');
        option.value = itemKey;
        option.textContent = `${itemValue.emoji} ${itemValue.label}`;
        itemSelect.appendChild(option);
    }
});

// ============================================================
// 7. Helper Functions
// ============================================================
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function getRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomItem() {
    const categoryKeys = Object.keys(categoryMap);
    const randomCategoryKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const category = categoryMap[randomCategoryKey];
    const itemKeys = Object.keys(category.items);
    const randomItemKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
    return { categoryKey: randomCategoryKey, itemKey: randomItemKey };
}

// ============================================================
// 8. Generate Character (main function)
// ============================================================
async function generateDrama(categoryKey, itemKey) {
    if (!categoryKey || !itemKey) {
        alert('Please select both a category and an item!');
        return;
    }

    const category = categoryMap[categoryKey];
    const item = category.items[itemKey];
    const itemLabel = item.label;
    const itemEmoji = item.emoji;
    const itemColor = item.color || getRandomColor(category.colors);

    stopVoice();

    generateBtn.disabled = true;
    randomBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';
    resultContent.innerHTML = `
        <div class="loading-text">
            <span style="font-size: 3rem; display: block;">🎭</span>
            Drawing your cartoon character...
        </div>
    `;

    try {
        const [jokeResponse, quoteResponse] = await Promise.all([
            fetchWithTimeout(jokeApiUrl, {}, 4000).catch(() => null),
            fetchWithTimeout(quoteApiUrl, {}, 4000).catch(() => null),
        ]);

        let jokeText = `"I'm not ${itemLabel.toLowerCase()}, I'm a lifestyle choice."`;
        if (jokeResponse && jokeResponse.ok) {
            const jokeData = await jokeResponse.json();
            if (jokeData.joke) jokeText = `"${jokeData.joke}"`;
        }

        let quoteText = `"I'm ${itemLabel.toLowerCase()} and I'm fabulous!"`;
        if (quoteResponse && quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            if (quoteData && quoteData.length > 0 && quoteData[0].Quote) {
                quoteText = `"${quoteData[0].Quote}"`;
            }
        }

        const adjectives = [
            'Grumpy', 'Dramatic', 'Judgmental', 'Overdramatic', 'Sassy', 
            'Furious', 'Moody', 'Chaotic', 'Silly', 'Wacky', 'Dramatic',
            'Sarcastic', 'Mysterious', 'Glamorous', 'Snarky', 'Quirky'
        ];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const characterName = `${adjective} ${itemLabel}`;

        lastCharacterName = characterName;
        lastQuoteText = quoteText;
        lastJokeText = jokeText;

        // Build the cartoon character result
        resultContent.innerHTML = `
            <div id="resultContent">
                <!-- Speech Bubble -->
                <div class="speech-bubble" id="speechBubble">
                    💬 ${quoteText}
                </div>

                <!-- Cartoon Character -->
                <div class="cartoon-character-container">
                    <div class="cartoon-character" id="cartoonCharacter">
                        <!-- Sound Waves -->
                        <div class="sound-waves">
                            <div class="sound-wave"></div>
                            <div class="sound-wave"></div>
                            <div class="sound-wave"></div>
                        </div>

                        <!-- Character Body -->
                        <div class="character-body" style="background: ${itemColor};">
                            <!-- Eyebrows -->
                            <div class="character-eyebrows" id="characterEyebrows">
                                <div class="character-eyebrow"></div>
                                <div class="character-eyebrow"></div>
                            </div>

                            <!-- Eyes -->
                            <div class="character-eyes" id="characterEyes">
                                <div class="character-eye"></div>
                                <div class="character-eye"></div>
                            </div>

                            <!-- Mouth -->
                            <div class="character-mouth" id="characterMouth"></div>

                            <!-- Emoji/Icon -->
                            <span class="character-icon">${itemEmoji}</span>

                            <!-- Name Tag -->
                            <span class="character-name-tag">${characterName}</span>
                        </div>
                    </div>
                </div>

                <div class="result-quote">${quoteText}</div>
                <div class="result-joke">💬 <em>also said:</em> ${jokeText}</div>
                <span class="result-category-tag">${category.label} • ${itemLabel}</span>

                <!-- VOICEOVER CONTROLS -->
                <div class="voice-controls">
                    <button class="voice-btn" id="playVoiceBtn" onclick="replayVoice()">
                        🔊 Play Voice
                    </button>
                    <button class="voice-btn" id="stopVoiceBtn" onclick="stopVoice()" disabled>
                        ⏹️ Stop
                    </button>
                </div>

                <!-- SHARE BUTTONS -->
                <div class="share-buttons">
                    <button onclick="shareTwitter('${characterName}', '${quoteText.replace(/"/g, '&quot;')}', '${jokeText.replace(/"/g, '&quot;')}')">🐦 Tweet</button>
                    <button onclick="shareFacebook('${characterName}', '${quoteText.replace(/"/g, '&quot;')}', '${jokeText.replace(/"/g, '&quot;')}')">📘 Share</button>
                </div>
            </div>
        `;

        // Auto-speak with animation
        setTimeout(() => {
            speakCharacter(characterName, quoteText, jokeText);
        }, 400);

    } catch (error) {
        console.error('Generation error:', error);
        resultContent.innerHTML = `
            <div style="color: var(--hot-magenta);">
                <span style="font-size: 3rem; display: block;">😅</span>
                <p>Oops! Something went wrong. Please try again.</p>
                <p style="font-size: 0.8rem; opacity: 0.7;">Error: ${error.message}</p>
            </div>
        `;
    } finally {
        generateBtn.disabled = false;
        randomBtn.disabled = false;
        generateBtn.textContent = '✨ Generate Character';
    }
}

// ============================================================
// 9. Random Drama Function
// ============================================================
function generateRandomDrama() {
    const { categoryKey, itemKey } = getRandomItem();
    
    categorySelect.value = categoryKey;
    
    const event = new Event('change');
    categorySelect.dispatchEvent(event);
    
    setTimeout(() => {
        itemSelect.value = itemKey;
        generateDrama(categoryKey, itemKey);
    }, 100);
}

// ============================================================
// 10. Share Functions
// ============================================================
function shareTwitter(name, quote, joke) {
    let cleanJoke = joke;
    if (cleanJoke.startsWith('"') && cleanJoke.endsWith('"')) cleanJoke = cleanJoke.slice(1, -1);
    const text = `🎭 Just met ${name}! ${quote} Also said: ${cleanJoke} 🎭 Get your own cartoon character at The Dramatic Plate!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://thedramaticplate.ie')}`, '_blank');
}

function shareFacebook(name, quote, joke) {
    let cleanJoke = joke;
    if (cleanJoke.startsWith('"') && cleanJoke.endsWith('"')) cleanJoke = cleanJoke.slice(1, -1);
    const text = `🎭 Just met ${name}! ${quote} Also said: ${cleanJoke} 🎭 Get your own cartoon character at The Dramatic Plate!`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://thedramaticplate.ie&quote=${encodeURIComponent(text)}`, '_blank');
}

// ============================================================
// 11. Form & Button Events
// ============================================================
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const categoryKey = categorySelect.value;
    const itemKey = itemSelect.value;
    generateDrama(categoryKey, itemKey);
});

randomBtn.addEventListener('click', function(e) {
    e.preventDefault();
    generateRandomDrama();
});

// ============================================================
// 12. Pre-load voices
// ============================================================
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// ============================================================
// 13. Welcome message
// ============================================================
window.addEventListener('load', function() {
    const placeholder = document.querySelector('.placeholder-text');
    if (placeholder) {
        const welcomeQuotes = [
            '"I\'m not a vegetable, I\'m a lifestyle choice." – Gerald',
            '"You ate the last biscuit. I\'m calling the police." – Barry',
            '"Orange? Please. I\'m burnt sienna." – Chloe'
        ];
        const randomWelcome = welcomeQuotes[Math.floor(Math.random() * welcomeQuotes.length)];
        placeholder.innerHTML = `
            <span class="big-emoji">🎭</span>
            Pick a category &amp; item above<br />
            <span style="font-size: 0.9rem; opacity: 0.7;">💬 ${randomWelcome}</span>
        `;
    }
});

// Make share functions globally accessible
window.shareTwitter = shareTwitter;
window.shareFacebook = shareFacebook;
window.replayVoice = replayVoice;
window.stopVoice = stopVoice;