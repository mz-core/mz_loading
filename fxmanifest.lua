fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Mazus / mz_core'
description 'mz_loading - loading screen premium para mz_core'
version '1.1.1'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

client_script 'client/main.lua'

files {
    'html/**/*',
    'assets/**/*'
}
