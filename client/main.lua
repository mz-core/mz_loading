-- mz_loading
-- Loading independente de framework. Fecha quando a sessão de rede inicia.
-- Se quiser controlar pelo mz_core depois, remova este arquivo e chame:
-- ShutdownLoadingScreenNui()
-- ShutdownLoadingScreen()

CreateThread(function()
    while not NetworkIsSessionStarted() do
        Wait(100)
    end

    -- Evita corte seco quando o player entra no spawn.
    Wait(1500)

    ShutdownLoadingScreenNui()
    ShutdownLoadingScreen()
end)
