window.MZ_LOADING_CONFIG = {
    serverName: 'MZ_CORE',
    visuals: { mouseGlow: true, cursor: true, parallax: true, reducedMotion: false, wallpaper: true, wallpaperQuality: 1 },
    subtitle: 'Framework modular para experiências FiveM',
    version: 'v1.0.0',
    initialStatus: 'Preparando conexão',
    initialDescription: 'Aguarde enquanto o mz_core organiza sua entrada.',
    fakeProgressUntil: 92,
    defaultVolume: 14,
    randomizeTracks: false,
    audioTracks: [
        {
            title: 'MZ Core Ambient',
            artist: 'mz_core',
            file: '../assets/audio/mz_core_ambient.wav',
            cover: '../assets/covers/mz_core_cover.svg'
        },

        // Para adicionar mais audio:
        // 1. Coloque o arquivo em mz_loading/assets/audio/
        // 2. Adicione outro item aqui, separando com virgula.
        //
        // Exemplo:
        // {
        //     title: 'Minha Musica',
        //     artist: 'Meu Servidor',
        //     file: '../assets/audio/minha-musica.mp3',
        //     cover: '../assets/covers/mz_core_cover.svg'
        // }
    ],

    features: [
        { label: 'Framework próprio', value: 'CORE' },
        { label: 'Sistema modular', value: 'MOD' },
        { label: 'Economia persistente', value: 'ECO' },
        { label: 'Organizações integradas', value: 'ORG' },
        { label: 'Inventário seguro', value: 'INV' },
        { label: 'HUD customizável', value: 'HUD' }
    ],

    tips: [
        'Use /hud para personalizar sua interface.',
        'Seu veículo pode manter combustível, dano e posição.',
        'Organizações possuem permissões, cargos e capacidades.',
        'A experiência foi construída em cima do MZ_CORE.',
        'Atalhos e módulos podem variar conforme a cidade.'
    ],

    keybinds: [
        { key: 'F1', label: 'Menu' },
        { key: 'F2', label: 'Inventário' },
        { key: 'T', label: 'Chat' },
        { key: 'ESC', label: 'Configurações' }
    ]
};
