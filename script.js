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
    // ----- ANIMALS -----
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
    
    // ----- FRUITS -----
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
    
    // ----- FOOD -----
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
    
    // ----- VEGETABLES -----
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
    
    // ----- DRINKS -----
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
    
    // ----- DESSERTS -----
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
    
    // ----- BIRDS -----
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
    
    // ----- SEA CREATURES -----
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
// 3. Language Translations for Voice Prompts
// ============================================================
const languageTranslations = {
    'en-US': {
        intro: 'Introducing...',
        alsoSaid: 'Also said:',
        emojiIntro: '🎭',
        getYourOwn: 'Get your own cartoon character at The Dramatic Plate!',
    },
    'en-GB': {
        intro: 'Introducing...',
        alsoSaid: 'Also said:',
        emojiIntro: '🎭',
        getYourOwn: 'Get your own cartoon character at The Dramatic Plate!',
    },
    'en-IE': {
        intro: 'Introducing...',
        alsoSaid: 'Also said:',
        emojiIntro: '🎭',
        getYourOwn: 'Get your own cartoon character at The Dramatic Plate!',
    },
    'es-ES': {
        intro: 'Presentando a...',
        alsoSaid: 'También dijo:',
        emojiIntro: '🎭',
        getYourOwn: '¡Consigue tu propio personaje de dibujos animados en The Dramatic Plate!',
    },
    'fr-FR': {
        intro: 'Présentation de...',
        alsoSaid: 'A également dit:',
        emojiIntro: '🎭',
        getYourOwn: 'Obtenez votre propre personnage de dessin animé sur The Dramatic Plate!',
    },
    'de-DE': {
        intro: 'Vorstellung...',
        alsoSaid: 'Sagte auch:',
        emojiIntro: '🎭',
        getYourOwn: 'Holen Sie sich Ihren eigenen Cartoon-Charakter bei The Dramatic Plate!',
    },
    'it-IT': {
        intro: 'Presentando...',
        alsoSaid: 'Ha anche detto:',
        emojiIntro: '🎭',
        getYourOwn: 'Ottieni il tuo personaggio dei cartoni animati su The Dramatic Plate!',
    },
    'pt-PT': {
        intro: 'Apresentando...',
        alsoSaid: 'Também disse:',
        emojiIntro: '🎭',
        getYourOwn: 'Obtenha o seu próprio personagem de desenho animado no The Dramatic Plate!',
    },
    'nl-NL': {
        intro: 'Introduceren...',
        alsoSaid: 'Zei ook:',
        emojiIntro: '🎭',
        getYourOwn: 'Krijg je eigen tekenfilmkarakter bij The Dramatic Plate!',
    },
    'pl-PL': {
        intro: 'Przedstawiam...',
        alsoSaid: 'Powiedział również:',
        emojiIntro: '🎭',
        getYourOwn: 'Zdobądź swoją własną postać z kreskówki na The Dramatic Plate!',
    },
    'ru-RU': {
        intro: 'Представляем...',
        alsoSaid: 'Также сказал:',
        emojiIntro: '🎭',
        getYourOwn: 'Получите своего собственного мультяшного персонажа на The Dramatic Plate!',
    },
    'ja-JP': {
        intro: '紹介します...',
        alsoSaid: 'また言った:',
        emojiIntro: '🎭',
        getYourOwn: 'The Dramatic Plateでオリジナルのキャラクターを手に入れよう！',
    },
    'ko-KR': {
        intro: '소개합니다...',
        alsoSaid: '또한 말하기:',
        emojiIntro: '🎭',
        getYourOwn: 'The Dramatic Plate에서 나만의 캐릭터를 만나보세요!',
    },
    'zh-CN': {
        intro: '介绍...',
        alsoSaid: '还说:',
        emojiIntro: '🎭',
        getYourOwn: '在The Dramatic Plate获取你自己的卡通角色！',
    },
    'hi-IN': {
        intro: 'पेश है...',
        alsoSaid: 'यह भी कहा:',
        emojiIntro: '🎭',
        getYourOwn: 'The Dramatic Plate पर अपना खुद का कार्टून चरित्र प्राप्त करें!',
    },
    'ar-SA': {
        intro: 'تقديم...',
        alsoSaid: 'قال أيضا:',
        emojiIntro: '🎭',
        getYourOwn: 'احصل على شخصية الكرتون الخاصة بك في The Dramatic Plate!',
    }
};

// ============================================================
// 4. DOM References
// ============================================================
const categorySelect = document.getElementById('categorySelect');
const itemSelect = document.getElementById('itemSelect');
const form = document.getElementById('generatorForm');
const resultContent = document.getElementById('resultContent');
const generateBtn = document.getElementById('generateBtn');
const randomBtn = document.getElementById('randomBtn');
const languageSelect = document.getElementById('languageSelect');

// ============================================================
// 5. IMPROVED Voice Selection System
// ============================================================
let currentUtterance = null;
let isPlaying = false;
let lastCharacterName = '';
let lastQuoteText = '';
let lastJokeText = '';
let lastLanguage = 'en-IE';
let lastGender = 'male';

// Male voice names to look for (common browser voice names)
const maleVoiceNames = [
    'male', 'david', 'daniel', 'alex', 'michael', 'james', 'john', 'robert', 
    'william', 'richard', 'joseph', 'thomas', 'charles', 'christopher', 'matthew',
    'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth',
    'kevin', 'brian', 'george', 'timothy', 'ronald', 'edward', 'jason', 'jeffrey',
    'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry',
    'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'raymond', 'gregory',
    'frank', 'alexander', 'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron',
    'jose', 'adam', 'nathan', 'henry', 'zachary', 'todd', 'wayne', 'kyle',
    'chad', 'carl', 'dean', 'steve', 'bruce', 'bob', 'bill', 'mike'
];

// Female voice names to look for (common browser voice names)
const femaleVoiceNames = [
    'female', 'samantha', 'karen', 'emma', 'zira', 'alice', 'susan', 'jessica',
    'amanda', 'melissa', 'sarah', 'lisa', 'angela', 'kimberly', 'laura', 'amy',
    'jennifer', 'nicole', 'michelle', 'tammy', 'deborah', 'elizabeth', 'heather',
    'helen', 'diana', 'catherine', 'katherine', 'anne', 'maria', 'nancy', 'ruth',
    'carol', 'janet', 'lori', 'cindy', 'terry', 'kathy', 'judy', 'cheryl',
    'megan', 'ashley', 'lauren', 'rachel', 'julie', 'tiffany', 'monica', 'stacy',
    'tina', 'sandra', 'bonnie', 'jill', 'barbara', 'nina', 'lily', 'rose'
];

function getVoiceForLanguageAndGender(lang, gender) {
    if (!window.speechSynthesis) return null;
    
    let voices = window.speechSynthesis.getVoices();
    
    // If no voices, wait and try again
    if (!voices || voices.length === 0) {
        return null;
    }
    
    // First, try to find voices that match the language exactly
    let langVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    
    // If no exact language match, try to find any voice with the language
    if (langVoices.length === 0) {
        langVoices = voices.filter(v => v.lang.includes(lang.split('-')[0]));
    }
    
    // If still no match, use all voices
    if (langVoices.length === 0) {
        langVoices = voices;
    }
    
    console.log(`Found ${langVoices.length} voices for language ${lang}`);
    
    let selectedVoice = null;
    
    if (gender === 'male') {
        // Try to find a male voice
        for (const voice of langVoices) {
            const voiceName = voice.name.toLowerCase();
            // Check if voice name contains any male name
            for (const maleName of maleVoiceNames) {
                if (voiceName.includes(maleName)) {
                    selectedVoice = voice;
                    console.log(`Found male voice: ${voice.name}`);
                    break;
                }
            }
            if (selectedVoice) break;
        }
        
        // If no male voice found, use the first available voice
        if (!selectedVoice && langVoices.length > 0) {
            selectedVoice = langVoices[0];
            console.log(`No male voice found, using default: ${selectedVoice.name}`);
        }
    } else {
        // Female voice
        for (const voice of langVoices) {
            const voiceName = voice.name.toLowerCase();
            for (const femaleName of femaleVoiceNames) {
                if (voiceName.includes(femaleName)) {
                    selectedVoice = voice;
                    console.log(`Found female voice: ${voice.name}`);
                    break;
                }
            }
            if (selectedVoice) break;
        }
        
        // If no female voice found, use the first available voice
        if (!selectedVoice && langVoices.length > 0) {
            selectedVoice = langVoices[0];
            console.log(`No female voice found, using default: ${selectedVoice.name}`);
        }
    }
    
    return selectedVoice;
}

function getLanguageTranslation(lang) {
    return languageTranslations[lang] || languageTranslations['en-IE'];
}

function speakCharacter(name, quote, joke, lang, gender) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (!window.speechSynthesis) return;

    // Clean up the joke and quote
    let cleanJoke = joke;
    if (cleanJoke.startsWith('"') && cleanJoke.endsWith('"')) {
        cleanJoke = cleanJoke.slice(1, -1);
    }
    let cleanQuote = quote;
    if (cleanQuote.startsWith('"') && cleanQuote.endsWith('"')) {
        cleanQuote = cleanQuote.slice(1, -1);
    }

    // Get translation for the selected language
    const translation = getLanguageTranslation(lang);
    
    // Build the message in the selected language
    const message = `${translation.intro} ${name}! ${cleanQuote} ${translation.alsoSaid} ${cleanJoke}`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.85;
    
    // Adjust pitch based on gender
    if (gender === 'male') {
        utterance.pitch = 0.9;
        utterance.rate = 0.85;
    } else {
        utterance.pitch = 1.3;
        utterance.rate = 0.9;
    }
    
    utterance.volume = 1;
    utterance.lang = lang;

    // Find appropriate voice
    const voice = getVoiceForLanguageAndGender(lang, gender);
    if (voice) {
        utterance.voice = voice;
        console.log(`Using voice: ${voice.name} (${voice.lang})`);
    } else {
        console.warn('No voice found, using default');
    }

    currentUtterance = utterance;
    isPlaying = true;
    updateVoiceButtons(true, lang, gender);
    startCartoonSpeaking();

    utterance.onend = () => {
        isPlaying = false;
        updateVoiceButtons(false, lang, gender);
        currentUtterance = null;
        stopCartoonSpeaking();
    };

    utterance.onerror = () => {
        isPlaying = false;
        updateVoiceButtons(false, lang, gender);
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
        speakCharacter(lastCharacterName, lastQuoteText, lastJokeText, lastLanguage, lastGender);
    }, 300);
}

function updateVoiceButtons(isPlaying, lang, gender) {
    const playBtn = document.getElementById('playVoiceBtn');
    const stopBtn = document.getElementById('stopVoiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    
    if (playBtn) {
        playBtn.disabled = isPlaying;
        if (isPlaying) {
            const genderEmoji = gender === 'male' ? '👨' : '👩';
            const langLabel = lang ? languageSelect.options[languageSelect.selectedIndex]?.text || '' : '';
            playBtn.innerHTML = `🔊 Speaking ${langLabel} ${genderEmoji}...`;
            playBtn.classList.add('playing');
        } else {
            const genderEmoji = lastGender === 'male' ? '👨' : '👩';
            const langLabel = lastLanguage ? languageSelect.options[languageSelect.selectedIndex]?.text || '' : '';
            playBtn.innerHTML = `🔊 Play Voice (${langLabel})`;
            playBtn.classList.remove('playing');
        }
    }
    if (stopBtn) {
        stopBtn.disabled = !isPlaying;
    }
    if (voiceStatus) {
        if (isPlaying) {
            const genderEmoji = gender === 'male' ? '👨' : '👩';
            voiceStatus.textContent = `🔊 Speaking in ${genderEmoji} voice...`;
            voiceStatus.style.display = 'block';
        } else {
            voiceStatus.style.display = 'none';
        }
    }
}

// ============================================================
// 6. Cartoon Speaking Animation
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
// 7. Populate Dropdowns
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
// 8. Helper Functions
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

function escapeHtmlAttr(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
}

function getSelectedVoiceSettings() {
    const lang = languageSelect.value;
    const genderRadio = document.querySelector('input[name="voiceGender"]:checked');
    const gender = genderRadio ? genderRadio.value : 'male';
    return { lang, gender };
}

// ============================================================
// 9. Generate Character - UPDATED
// ============================================================
async function generateDrama(categoryKey, itemKey) {
    if (!categoryKey || !itemKey) {
        alert('Please select both a category and an item!');
        return;
    }

    // Get voice settings
    const voiceSettings = getSelectedVoiceSettings();
    lastLanguage = voiceSettings.lang;
    lastGender = voiceSettings.gender;

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
            'Furious', 'Moody', 'Chaotic', 'Silly', 'Wacky',
            'Sarcastic', 'Mysterious', 'Glamorous', 'Snarky', 'Quirky'
        ];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const characterName = `${adjective} ${itemLabel}`;

        lastCharacterName = characterName;
        lastQuoteText = quoteText;
        lastJokeText = jokeText;

        const safeName = escapeHtmlAttr(characterName);
        const safeQuote = escapeHtmlAttr(quoteText);
        const safeJoke = escapeHtmlAttr(jokeText);

        // Get language label for display
        const langLabel = languageSelect.options[languageSelect.selectedIndex]?.text || 'English';
        const genderEmoji = lastGender === 'male' ? '👨' : '👩';
        const genderLabel = lastGender === 'male' ? 'Male' : 'Female';

        resultContent.innerHTML = `
            <div id="resultContent">
                <div class="speech-bubble" id="speechBubble">
                    💬 ${quoteText}
                </div>

                <div class="cartoon-character-container">
                    <div class="cartoon-character" id="cartoonCharacter">
                        <div class="sound-waves">
                            <div class="sound-wave"></div>
                            <div class="sound-wave"></div>
                            <div class="sound-wave"></div>
                        </div>

                        <div class="character-body" style="background: ${itemColor};">
                            <div class="character-eyebrows" id="characterEyebrows">
                                <div class="character-eyebrow"></div>
                                <div class="character-eyebrow"></div>
                            </div>

                            <div class="character-eyes" id="characterEyes">
                                <div class="character-eye"></div>
                                <div class="character-eye"></div>
                            </div>

                            <div class="character-mouth" id="characterMouth"></div>

                            <span class="character-icon">${itemEmoji}</span>

                            <span class="character-name-tag">${characterName}</span>
                        </div>
                    </div>
                </div>

                <div class="result-quote">${quoteText}</div>
                <div class="result-joke">💬 <em>also said:</em> ${jokeText}</div>
                <span class="result-category-tag">${category.label} • ${itemLabel}</span>

                <!-- Voice Settings Display -->
                <div class="voice-settings-display">
                    <span class="voice-badge">🌐 ${langLabel}</span>
                    <span class="voice-badge">${genderEmoji} ${genderLabel}</span>
                    <span class="voice-badge" id="voiceStatus" style="display:none;">🔊 Speaking...</span>
                </div>

                <div class="voice-controls">
                    <button class="voice-btn" id="playVoiceBtn" onclick="replayVoice()">
                        🔊 Play Voice (${langLabel})
                    </button>
                    <button class="voice-btn" id="stopVoiceBtn" onclick="stopVoice()" disabled>
                        ⏹️ Stop
                    </button>
                </div>

                <!-- SHARE BUTTONS -->
                <div class="share-buttons">
                    <button data-share="twitter" data-name="${safeName}" data-quote="${safeQuote}" data-joke="${safeJoke}">
                        🐦 Twitter
                    </button>
                    <button data-share="facebook" data-name="${safeName}" data-quote="${safeQuote}" data-joke="${safeJoke}">
                        📘 Facebook
                    </button>
                    <button data-share="pinterest" data-name="${safeName}" data-quote="${safeQuote}" data-joke="${safeJoke}">
                        📌 Pinterest
                    </button>
                    <button data-share="whatsapp" data-name="${safeName}" data-quote="${safeQuote}" data-joke="${safeJoke}">
                        💬 WhatsApp
                    </button>
                    <button data-share="reddit" data-name="${safeName}" data-quote="${safeQuote}" data-joke="${safeJoke}">
                        🤖 Reddit
                    </button>
                    <button data-share="linkedin" data-name="${safeName}" data-quote="${safeQuote}" data-joke="${safeJoke}">
                        💼 LinkedIn
                    </button>
                    <button data-share="copy" data-name="${safeName}" data-quote="${safeQuote}" data-joke="${safeJoke}">
                        📋 Copy
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners to the share buttons
        document.querySelectorAll('.share-buttons button[data-share]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const type = this.dataset.share;
                const name = this.dataset.name;
                const quote = this.dataset.quote;
                const joke = this.dataset.joke;
                
                switch(type) {
                    case 'twitter': shareTwitter(name, quote, joke); break;
                    case 'facebook': shareFacebook(name, quote, joke); break;
                    case 'pinterest': sharePinterest(name, quote, joke); break;
                    case 'whatsapp': shareWhatsApp(name, quote, joke); break;
                    case 'reddit': shareReddit(name, quote, joke); break;
                    case 'linkedin': shareLinkedIn(name, quote, joke); break;
                    case 'copy': copyToClipboard(name, quote, joke); break;
                }
            });
        });

        setTimeout(() => {
            speakCharacter(characterName, quoteText, jokeText, lastLanguage, lastGender);
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
// 10. Random Drama Function
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
// 11. Social Share Functions
// ============================================================
function shareTwitter(name, quote, joke) {
    let cleanJoke = joke.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanQuote = quote.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanName = name.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    
    const shareText = `🎭 Just met ${cleanName}! ${cleanQuote} Also said: ${cleanJoke} 🎭 Get your own cartoon character at The Dramatic Plate!`;
    const url = 'https://thedramaticplate.ie';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
}

function shareFacebook(name, quote, joke) {
    let cleanJoke = joke.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanQuote = quote.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanName = name.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    
    const shareText = `🎭 Just met ${cleanName}! ${cleanQuote} Also said: ${cleanJoke} 🎭 Get your own cartoon character at The Dramatic Plate!`;
    const url = 'https://thedramaticplate.ie';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
}

function sharePinterest(name, quote, joke) {
    let cleanJoke = joke.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanQuote = quote.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanName = name.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    
    const description = `${cleanName} – ${cleanQuote} Also said: ${cleanJoke}`;
    const url = 'https://thedramaticplate.ie';
    const imageUrl = 'https://via.placeholder.com/800x600/FFDE21/1a1a1a?text=Dramatic+Plate';
    window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`, '_blank', 'width=600,height=400');
}

function shareWhatsApp(name, quote, joke) {
    let cleanJoke = joke.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanQuote = quote.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanName = name.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    
    const shareText = `🎭 Just met ${cleanName}! ${cleanQuote} Also said: ${cleanJoke} 🎭 Get your own cartoon character at The Dramatic Plate! https://thedramaticplate.ie`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
}

function shareReddit(name, quote, joke) {
    let cleanJoke = joke.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanQuote = quote.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanName = name.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    
    const title = `🎭 Just met ${cleanName}!`;
    const shareText = `${cleanQuote} Also said: ${cleanJoke}`;
    const url = 'https://thedramaticplate.ie';
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title + ' ' + shareText)}`, '_blank', 'width=600,height=400');
}

function shareLinkedIn(name, quote, joke) {
    let cleanJoke = joke.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanQuote = quote.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanName = name.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    
    const shareText = `🎭 Just met ${cleanName}! ${cleanQuote} Also said: ${cleanJoke}`;
    const url = 'https://thedramaticplate.ie';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
}

function copyToClipboard(name, quote, joke) {
    let cleanJoke = joke.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanQuote = quote.replace(/^"|"$/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    let cleanName = name.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    
    const text = `🎭 Just met ${cleanName}! ${cleanQuote} Also said: ${cleanJoke} 🎭 Get your own cartoon character at The Dramatic Plate! https://thedramaticplate.ie`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.activeElement;
            if (btn) {
                const original = btn.textContent;
                btn.textContent = '✅ Copied!';
                btn.style.background = '#6BCB77';
                btn.style.color = 'white';
                setTimeout(() => {
                    btn.textContent = original;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            }
        }).catch(() => {
            navigator.clipboard.writeText(text);
        });
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        const btn = document.activeElement;
        if (btn) {
            const original = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.style.background = '#6BCB77';
            btn.style.color = 'white';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }
    }
}

// ============================================================
// 12. Form & Button Events
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
// 13. Pre-load voices and debug
// ============================================================
if (window.speechSynthesis) {
    // Force voice list to load
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log(`Loaded ${voices.length} voices`);
        // Log available voices for debugging
        voices.forEach(v => console.log(`Voice: ${v.name} (${v.lang})`));
    };
}

// ============================================================
// 14. Make functions globally accessible
// ============================================================
window.shareTwitter = shareTwitter;
window.shareFacebook = shareFacebook;
window.sharePinterest = sharePinterest;
window.shareWhatsApp = shareWhatsApp;
window.shareReddit = shareReddit;
window.shareLinkedIn = shareLinkedIn;
window.copyToClipboard = copyToClipboard;
window.replayVoice = replayVoice;
window.stopVoice = stopVoice;

// ============================================================
// 15. Welcome message
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
            <span style="font-size: 0.8rem; opacity: 0.5; display: block; margin-top: 0.5rem;">
                🌐 Select a language &amp; voice gender
            </span>
        `;
    }
});

// ============================================================
// 16. Popular Characters
// ============================================================
function generatePopularCharacters() {
    const grid = document.getElementById('popularGrid');
    if (!grid) return;
    
    const popularItems = [
        { emoji: '🍌', name: 'Grumpy Banana', category: 'Fruits' },
        { emoji: '🐶', name: 'Dramatic Dog', category: 'Animals' },
        { emoji: '🍕', name: 'Judgmental Pizza', category: 'Food' },
        { emoji: '🥕', name: 'Sassy Carrot', category: 'Vegetables' },
        { emoji: '🦊', name: 'Mysterious Fox', category: 'Animals' },
        { emoji: '🍓', name: 'Overdramatic Strawberry', category: 'Fruits' },
        { emoji: '🐱', name: 'Moody Cat', category: 'Animals' },
        { emoji: '🍦', name: 'Chill Ice Cream', category: 'Desserts' },
    ];
    
    grid.innerHTML = popularItems.map(item => `
        <div class="popular-card" onclick="generateFromPopular('${item.name}', '${item.category}')">
            <span class="emoji">${item.emoji}</span>
            <span class="name">${item.name}</span>
            <span class="category">${item.category}</span>
        </div>
    `).join('');
}

window.generateFromPopular = function(name, category) {
    let categoryKey = null;
    let itemKey = null;
    
    for (const [catKey, catValue] of Object.entries(categoryMap)) {
        if (catValue.label.includes(category) || category.includes(catValue.label)) {
            categoryKey = catKey;
            for (const [itemKeyVal, itemValue] of Object.entries(catValue.items)) {
                if (name.toLowerCase().includes(itemValue.label.toLowerCase())) {
                    itemKey = itemKeyVal;
                    break;
                }
            }
            if (itemKey) break;
        }
    }
    
    if (categoryKey && itemKey) {
        categorySelect.value = categoryKey;
        const event = new Event('change');
        categorySelect.dispatchEvent(event);
        setTimeout(() => {
            itemSelect.value = itemKey;
            generateDrama(categoryKey, itemKey);
        }, 100);
    } else {
        generateRandomDrama();
    }
};

// Call on load
window.addEventListener('load', function() {
    generatePopularCharacters();
});