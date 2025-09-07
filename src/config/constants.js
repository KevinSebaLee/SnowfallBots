export const XP_CONFIG = {
    // Base XP configuration
    BASE_EXP: 50,
    GROWTH_RATE: 1.025,

    // XP gain settings
    BASE_XP_GAIN: 50,
    MIN_XP_GAIN: 5,
    MAX_XP_GAIN: 15,

    // Cooldown settings (in milliseconds)
    XP_COOLDOWN: 60 * 1000, // 1 minute

    // Event probabilities
    GLOBAL_MULTIPLIER_CHANCE: 0.002, // 0.2%
    QUICK_XP_EVENT_CHANCE: 0.001,    // 0.1%

    // Event durations
    GLOBAL_MULTIPLIER_DURATION: 5 * 60 * 1000, // 5 minutes
    QUICK_XP_EVENT_TIMEOUT: 15 * 1000,         // 15 seconds

    // Multipliers
    DEFAULT_MULTIPLIER: 1,
    EVENT_MULTIPLIER: 2,

    // Bonus XP range for quick events
    QUICK_EVENT_MIN_BONUS: 500,
    QUICK_EVENT_MAX_BONUS: 600,

    // Background image for XP widget
    BACKGROUND_IMAGE_URL: './src/assets/banner/XP_banner.jpg',
};

export const DISCORD_CONFIG = {
    // Message limits
    MAX_USERNAME_DISPLAY: 20,

    // Image settings
    AVATAR_SIZE: 256,
    DEFAULT_AVATAR: 'https://cdn.discordapp.com/embed/avatars/0.png',

    // Canvas settings
    DEFAULT_CANVAS_WIDTH: 600,
    DEFAULT_CANVAS_HEIGHT: 250,
    MOBILE_THRESHOLD: 400
};

export const COLORS = {
    // XP Widget colors
    PRIMARY: '#7b9fff',
    BACKGROUND: '#dbeafe',
    OVERLAY: 'rgba(255,255,255,0.7)',

    // Rank colors
    RANK_GOLD: '#FFD700',
    RANK_SILVER: '#C0C0C0',
    RANK_BRONZE: '#CD7F32',
    RANK_DEFAULT: '#444',

    // Embed colors
    SUCCESS: 0x1abc9c,
    ERROR: 0xe74c3c,
    WARNING: 0xf39c12,
    INFO: 0x3498db,

    // Ship colors
    SHIP: 0xff69b4,
    MATCH: 0x00bfff
};

export const BADGE_CONFIG = {
    BADGES: [
        { id: 1, file: 'top1.png', name: 'Top 1' },
        { id: 2, file: 'top10.png', name: 'Top 10' },
        { id: 3, file: 'hablarFrost.png', name: 'Frost Speaker' },
        { id: 4, file: 'fantasma.png', name: 'Ghost' },
        { id: 5, file: 'fantasmaX.png', name: 'Ghost X' },
        { id: 7, file: 'activoNoche.png', name: 'Night Active' },
        { id: 8, file: 'activoDia.png', name: 'Day Active' },
        { id: 9, file: 'image.png', name: 'Special Badge' }
    ],
    BASE_PATH: 'src/assets/badges/'
};

export const DATABASE_CONFIG = {
    // Table names
    TABLES: {
        USERS: 'users',
        GUILDS: 'guilds',
        USER_GUILD: 'user_guild',
        USER_BADGE: 'user_badge'
    },

    // Query limits
    LEADERBOARD_LIMIT: 10,
    BATCH_SIZE: 100
};
