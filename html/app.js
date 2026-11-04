(function () {
    'use strict';

    const config = window.MZ_LOADING_CONFIG || {};
    const configuredTracks = Array.isArray(config.audioTracks) && config.audioTracks.length
        ? config.audioTracks
        : window.MZ_AUDIO_TRACKS;
    const tracks = Array.isArray(configuredTracks) && configuredTracks.length
        ? configuredTracks
        : [{ title: 'MZ Core Ambient', artist: 'mz_core', file: '../assets/audio/mz_core_ambient.wav', cover: '../assets/covers/mz_core_cover.svg' }];

    const $ = (selector) => document.querySelector(selector);

    const state = {
        progress: 0,
        targetProgress: 0,
        initTotal: 0,
        dataTotal: 0,
        dataLoaded: 0,
        tipIndex: 0,
        trackIndex: config.randomizeTracks ? Math.floor(Math.random() * tracks.length) : 0,
        userSeeking: false,
        lastStage: ''
    };

    const els = {
        subtitle: $('#server-subtitle'),
        version: $('#server-version'),
        footerStatus: $('#footer-status'),
        featureList: $('#feature-list'),
        keybindList: $('#keybind-list'),
        tipText: $('#tip-text'),
        stageLabel: $('#stage-label'),
        progressFill: $('#progress-fill'),
        progressPercent: $('#progress-percent'),
        downloadDesc: $('#download-desc'),
        audio: $('#mz-audio'),
        cover: $('#track-cover'),
        title: $('#track-title'),
        artist: $('#track-artist'),
        seek: $('#seek'),
        currentTime: $('#current-time'),
        durationTime: $('#duration-time'),
        volume: $('#volume'),
        btnPlay: $('#toggle-play'),
        btnPrev: $('#prev-track'),
        btnNext: $('#next-track'),
        btnMute: $('#toggle-mute'),
        btnPanel: $('#toggle-panel'),
        btnPanelIcon: $('#toggle-panel-icon')
    };

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function updateRangeFill(input) {
        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        const value = Number(input.value || 0);
        const percent = ((value - min) / (max - min)) * 100;
        input.style.setProperty('--range', `${clamp(percent, 0, 100)}%`);
    }

    function applyConfig() {
        if (config.subtitle) els.subtitle.textContent = config.subtitle;
        if (config.version) els.version.textContent = config.version;
        setStage(config.initialStatus || 'Preparando conexão', config.initialDescription || 'Aguarde enquanto o mz_core organiza sua entrada.');

        const features = Array.isArray(config.features) ? config.features : [];
        els.featureList.innerHTML = features.map((item) => `
            <div class="feature-pill">
                <strong>${escapeHtml(item.value || '')}</strong>
                <span>${escapeHtml(item.label || '')}</span>
            </div>
        `).join('');

        const keybinds = Array.isArray(config.keybinds) ? config.keybinds : [];
        els.keybindList.innerHTML = keybinds.map((item) => `
            <div class="keybind-item">
                <kbd>${escapeHtml(item.key || '')}</kbd>
                <span>${escapeHtml(item.label || '')}</span>
            </div>
        `).join('');
    }

    function setStage(title, description) {
        const cleanTitle = String(title || '').replace(/\^\d/g, '').trim();
        const cleanDescription = String(description || '').replace(/\^\d/g, '').trim();

        if (cleanTitle) {
            state.lastStage = cleanTitle;
            els.stageLabel.textContent = cleanTitle;
            els.footerStatus.textContent = cleanTitle;
        }

        if (cleanDescription) {
            els.downloadDesc.textContent = cleanDescription;
        }
    }

    function setTargetProgress(value) {
        state.targetProgress = Math.max(state.targetProgress, clamp(Number(value) || 0, 0, 100));
    }

    function animateProgress() {
        const diff = state.targetProgress - state.progress;
        state.progress += diff * 0.08;

        if (Math.abs(diff) < 0.08) state.progress = state.targetProgress;

        const safe = clamp(state.progress, 0, 100);
        els.progressFill.style.width = `${safe}%`;
        els.progressPercent.textContent = `${Math.floor(safe)}%`;

        requestAnimationFrame(animateProgress);
    }

    function startFallbackProgress() {
        const cap = Number(config.fakeProgressUntil || 92);
        setInterval(() => {
            if (state.targetProgress < cap) {
                const boost = state.targetProgress < 28 ? 1.05 : state.targetProgress < 70 ? 0.48 : 0.14;
                setTargetProgress(state.targetProgress + boost);
            }
        }, 900);
    }

    function startTips() {
        const tips = Array.isArray(config.tips) ? config.tips : [];
        if (!tips.length) return;

        function applyTip() {
            els.tipText.style.opacity = '0';
            setTimeout(() => {
                els.tipText.textContent = tips[state.tipIndex % tips.length];
                els.tipText.style.opacity = '1';
                state.tipIndex += 1;
            }, 180);
        }

        els.tipText.style.transition = 'opacity .22s ease';
        applyTip();
        setInterval(applyTip, 6400);
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    function applyVolume(value) {
        const safe = clamp(Number(value), 0, 100);
        els.volume.value = String(safe);
        els.audio.volume = safe / 100;
        updateRangeFill(els.volume);
    }

    function syncPlayState() {
        document.body.classList.toggle('is-playing', !els.audio.paused);
    }

    function syncMuteState() {
        document.body.classList.toggle('is-muted', els.audio.muted || Number(els.volume.value) <= 0);
    }

    function safePlay() {
        applyVolume(els.volume.value);
        const promise = els.audio.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {
                // CEF pode bloquear autoplay até a primeira interação do usuário.
            });
        }
    }

    function applyTrack(index) {
        state.trackIndex = (index + tracks.length) % tracks.length;
        const track = tracks[state.trackIndex] || tracks[0];

        els.audio.src = track.file;
        els.audio.load();
        els.cover.src = track.cover || '../assets/covers/mz_core_cover.svg';
        els.title.textContent = track.title || 'Tocando agora';
        els.artist.textContent = track.artist || 'mz_core';
        els.seek.value = '0';
        els.currentTime.textContent = '0:00';
        els.durationTime.textContent = '0:00';
        updateRangeFill(els.seek);
    }

    function nextTrack() {
        const wasPlaying = !els.audio.paused;
        applyTrack(state.trackIndex + 1);
        if (wasPlaying) safePlay();
    }

    function previousTrack() {
        const wasPlaying = !els.audio.paused;
        applyTrack(state.trackIndex - 1);
        if (wasPlaying) safePlay();
    }


    function setPanelCollapsed(collapsed) {
        document.body.classList.toggle('is-panel-collapsed', collapsed);

        if (els.btnPanel) {
            els.btnPanel.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            els.btnPanel.setAttribute('aria-label', collapsed ? 'Mostrar player de música' : 'Esconder player de música');
        }

        if (els.btnPanelIcon) {
            els.btnPanelIcon.textContent = collapsed ? '<' : '>';
        }
    }

    function bindPanelToggle() {
        if (!els.btnPanel) return;

        els.btnPanel.addEventListener('click', () => {
            setPanelCollapsed(!document.body.classList.contains('is-panel-collapsed'));
        });

        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'h') {
                setPanelCollapsed(!document.body.classList.contains('is-panel-collapsed'));
            }
        });
    }

    function bindPlayer() {
        applyVolume(config.defaultVolume || 14);
        applyTrack(state.trackIndex);

        els.btnPlay.addEventListener('click', () => {
            if (els.audio.paused) safePlay();
            else els.audio.pause();
        });

        els.btnPrev.addEventListener('click', previousTrack);
        els.btnNext.addEventListener('click', nextTrack);

        els.btnMute.addEventListener('click', () => {
            els.audio.muted = !els.audio.muted;
            syncMuteState();
        });

        els.volume.addEventListener('input', () => {
            applyVolume(els.volume.value);
            if (Number(els.volume.value) > 0 && els.audio.muted) els.audio.muted = false;
            syncMuteState();
        });

        els.seek.addEventListener('pointerdown', () => {
            state.userSeeking = true;
        });

        els.seek.addEventListener('pointerup', () => {
            const duration = els.audio.duration || 0;
            if (duration > 0) {
                els.audio.currentTime = (Number(els.seek.value) / 1000) * duration;
            }
            state.userSeeking = false;
        });

        els.seek.addEventListener('input', () => {
            updateRangeFill(els.seek);
            const duration = els.audio.duration || 0;
            if (duration > 0) {
                els.currentTime.textContent = formatTime((Number(els.seek.value) / 1000) * duration);
            }
        });

        els.audio.addEventListener('loadedmetadata', () => {
            els.durationTime.textContent = formatTime(els.audio.duration);
        });

        els.audio.addEventListener('timeupdate', () => {
            if (!state.userSeeking && els.audio.duration > 0) {
                els.seek.value = String(Math.floor((els.audio.currentTime / els.audio.duration) * 1000));
                els.currentTime.textContent = formatTime(els.audio.currentTime);
                els.durationTime.textContent = formatTime(els.audio.duration);
                updateRangeFill(els.seek);
            }
        });

        els.audio.addEventListener('play', syncPlayState);
        els.audio.addEventListener('pause', syncPlayState);
        els.audio.addEventListener('ended', nextTrack);

        ['pointerdown', 'keydown'].forEach((eventName) => {
            window.addEventListener(eventName, () => {
                if (els.audio.paused) safePlay();
            }, { once: true });
        });

        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (key === ' ') {
                event.preventDefault();
                if (els.audio.paused) safePlay();
                else els.audio.pause();
            }
            if (key === 'arrowright') nextTrack();
            if (key === 'arrowleft') previousTrack();
            if (key === 'm') {
                els.audio.muted = !els.audio.muted;
                syncMuteState();
            }
        });

        syncPlayState();
        syncMuteState();
    }

    function bindLoadscreenEvents() {
        const handlers = {
            startInitFunctionOrder(data) {
                state.initTotal = Number(data.count || 0);
                setStage('Inicializando recursos', 'Preparando scripts e módulos do servidor.');
                setTargetProgress(7);
            },
            initFunctionInvoking(data) {
                const idx = Number(data.idx || 0);
                setStage('Inicializando recursos', 'Executando funções iniciais dos resources.');
                if (state.initTotal > 0) setTargetProgress(7 + (idx / state.initTotal) * 33);
            },
            startDataFileEntries(data) {
                state.dataTotal = Number(data.count || 0);
                state.dataLoaded = 0;
                setStage('Baixando assets', 'Recebendo mapas, imagens, sons e arquivos necessários.');
                setTargetProgress(42);
            },
            performMapLoadFunction() {
                state.dataLoaded += 1;
                setStage('Montando cidade', 'Aplicando mapa, stream e dados do mundo.');
                if (state.dataTotal > 0) {
                    setTargetProgress(42 + (state.dataLoaded / state.dataTotal) * 50);
                } else {
                    setTargetProgress(state.targetProgress + 0.6);
                }
            },
            onLogLine(data) {
                if (data && data.message) {
                    const msg = String(data.message).replace(/\^\d/g, '').slice(0, 90);
                    if (msg) els.footerStatus.textContent = msg;
                }
            }
        };

        window.addEventListener('message', (event) => {
            const data = event.data || {};
            const handler = handlers[data.eventName];
            if (handler) handler(data);
        });
    }

    function bindVisualEffects() {
        const options = config.visuals || {};
        const reduced = options.reducedMotion === true || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) document.body.classList.add('mz-reduced-motion');
        const cursor = $('.mz-cursor');
        const glow = $('.mz-cursor-glow');
        const atmosphere = $('.mz-atmosphere');
        const useCursor = options.cursor !== false && !reduced;
        const useGlow = options.mouseGlow !== false && !reduced;
        if (!useCursor && !useGlow && (options.parallax === false || reduced)) return;
        if (useCursor) document.body.classList.add('mz-cursor-enabled');
        let x = -1000, y = -1000, gx = -1000, gy = -1000, lastX = -1000, lastY = -1000;
        let active = false, frame = 0;
        const onMove = (event) => {
            x = event.clientX; y = event.clientY;
            if (!active) { active = true; gx = x; gy = y; document.body.classList.add('mz-mouse-active'); }
            document.body.classList.toggle('mz-mouse-interactive', !!event.target.closest('button,input,a'));
            if (!frame) frame = requestAnimationFrame(draw);
        };
        const draw = () => {
            frame = 0;
            if (!active) return;
            gx += (x - gx) * .19; gy += (y - gy) * .19;
            if (useCursor) cursor.style.transform = `translate3d(${x - 19}px,${y - 19}px,0)`;
            if (useGlow) glow.style.transform = `translate3d(${gx - 160}px,${gy - 160}px,0)`;
            if (options.parallax !== false && !reduced) {
                atmosphere.style.setProperty('--parallax-x', `${((x / window.innerWidth) - .5) * 22}px`);
                atmosphere.style.setProperty('--parallax-y', `${((y / window.innerHeight) - .5) * 16}px`);
            }
            if (Math.abs(x-gx) > .5 || Math.abs(y-gy) > .5 || x !== lastX || y !== lastY) {
                lastX = x; lastY = y;
                frame = requestAnimationFrame(draw);
            }
        };
        window.addEventListener('pointermove', onMove, {passive:true});
        document.addEventListener('mouseleave', () => {active=false;document.body.classList.remove('mz-mouse-active');});
        window.addEventListener('blur', () => {active=false;document.body.classList.remove('mz-mouse-active');});
    }

    function init() {
        applyConfig();
        bindVisualEffects();
        startTips();
        bindPlayer();
        bindPanelToggle();
        bindLoadscreenEvents();
        animateProgress();
        startFallbackProgress();
    }

    document.addEventListener('DOMContentLoaded', init);
}());
