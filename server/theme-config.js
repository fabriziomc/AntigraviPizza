// theme-config.js - Visual configuration for all themes

const THEME_CONFIG = {
    christmas: {
        emoji: '🎄',
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #7c2d12 100%)',
        decorations: '🎅 🍕 ⭐ 🎁 🍕 🎄',
        effect: 'snow',
        imagePath: '/images/themes/christmas_pizza.png',
        colors: {
            primary: '#7c2d12',
            secondary: '#1e3a8a',
            text: '#ffffff'
        }
    },
    newyear: {
        emoji: '🎉',
        gradient: 'linear-gradient(135deg, #4c1d95 0%, #fbbf24 100%)',
        decorations: '🎊 🍕 ✨ 🥂 🍕 🎆',
        effect: 'fireworks',
        imagePath: '/images/themes/newyear_pizza.png',
        colors: {
            primary: '#fbbf24',
            secondary: '#4c1d95',
            text: '#ffffff'
        }
    },
    halloween: {
        emoji: '🎃',
        gradient: 'linear-gradient(135deg, #1f2937 0%, #fb923c 100%)',
        decorations: '👻 🍕 🎃 🦇 🍕 🕷️',
        effect: 'bats',
        imagePath: '/images/themes/halloween_pizza.png',
        colors: {
            primary: '#fb923c',
            secondary: '#1f2937',
            text: '#ffffff'
        }
    },
    easter: {
        emoji: '🐰',
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #a78bfa 100%)',
        decorations: '🐰 🍕 🥚 🌷 🍕 🐣',
        effect: 'petals',
        imagePath: '/images/themes/easter_pizza.png',
        colors: {
            primary: '#a78bfa',
            secondary: '#fef3c7',
            text: '#374151'
        }
    },
    valentine: {
        emoji: '💕',
        gradient: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)',
        decorations: '💕 🍕 💝 🌹 🍕 💖',
        effect: 'hearts',
        imagePath: '/images/themes/valentine_pizza.png',
        colors: {
            primary: '#be123c',
            secondary: '#fb7185',
            text: '#ffffff'
        }
    },
    carnival: {
        emoji: '🎭',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #fbbf24 100%)',
        decorations: '🎭 🍕 🎊 🎉 🍕 🎪',
        effect: 'confetti',
        imagePath: '/images/themes/carnival_pizza.png',
        colors: {
            primary: '#7c3aed',
            secondary: '#fbbf24',
            text: '#ffffff'
        }
    },
    ferragosto: {
        emoji: '☀️',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #f59e0b 100%)',
        decorations: '☀️ 🍕 🏖️ 🌊 🍕 ⛱️',
        effect: 'waves',
        imagePath: '/images/themes/ferragosto_pizza.png',
        colors: {
            primary: '#f59e0b',
            secondary: '#0ea5e9',
            text: '#ffffff'
        }
    },
    birthday: {
        emoji: '🎂',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        decorations: '🎂 🍕 🎈 🎁 🍕 🎉',
        effect: 'balloons',
        imagePath: '/images/themes/birthday_pizza.png',
        colors: {
            primary: '#ec4899',
            secondary: '#8b5cf6',
            text: '#ffffff'
        }
    },
    summer: {
        emoji: '🌴',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
        decorations: '🌴 🍕 🌊 ☀️ 🍕 🏄',
        effect: 'bubbles',
        imagePath: '/images/themes/summer_pizza.png',
        colors: {
            primary: '#10b981',
            secondary: '#06b6d4',
            text: '#ffffff'
        }
    },
    classic: {
        emoji: '🍕',
        gradient: 'linear-gradient(135deg, #dc2626 0%, #fbbf24 100%)',
        decorations: '🍕 🍕 🍕 🍕 🍕 🍕',
        effect: 'none',
        imagePath: '/images/themes/classic_pizza.png',
        colors: {
            primary: '#dc2626',
            secondary: '#fbbf24',
            text: '#ffffff'
        }
    }
};

/**
 * Get theme configuration by theme ID
 * @param {string} themeId - The theme identifier
 * @returns {object} - Theme configuration object
 */
function getThemeConfig(themeId) {
    return THEME_CONFIG[themeId] || THEME_CONFIG.classic;
}

/**
 * Get all available themes
 * @returns {object} - All theme configurations
 */
function getAllThemes() {
    return THEME_CONFIG;
}

export {
    THEME_CONFIG,
    getThemeConfig,
    getAllThemes
};
