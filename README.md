# mz_loading

Loading screen premium para o `mz_core`, adaptada do visual gerado no v0 para HTML/CSS/JS puro, sem Next.js/React dentro do FiveM.

Inclui player lateral em modo drawer: ao recolher, o painel sai da tela de verdade e fica somente uma aba fina na borda direita. Também pode ser alternado pela tecla `H`.

## Instalação

Coloque a pasta em:

```txt
resources/[mz]/mz_loading
```

No `server.cfg`:

```cfg
ensure mz_loading
```

Sugestão de ordem:

```cfg
ensure mapmanager
ensure spawnmanager
ensure mz_loading
ensure oxmysql
ensure ox_lib
ensure mz_core
```

## Personalização

Textos, cards, dicas, atalhos e volume padrão:

```txt
html/config.js
```

Músicas:

```txt
assets/audio/
html/tracks.js
```

Capas:

```txt
assets/covers/
```

Logo:

```txt
assets/branding/logo.png
```

## Observação

O player tenta iniciar automaticamente, mas alguns CEF/Chromium podem exigir a primeira interação do jogador. Clique, espaço ou qualquer tecla tentam iniciar o áudio.

LIVE WALLPAPER: canvas procedural sem imagens externas. Efeito de ondas, partículas, halo e reação ao mouse. Configure em html/config.js -> visuals.wallpaper e wallpaperQuality (0.4 a 1.5). Respeita reducedMotion.
