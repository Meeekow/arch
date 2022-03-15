" enable vim sneak; rebind f and F to vim sneak
let g:sneak#label = 1
nmap <silent> f <Plug>Sneak_s
nmap <silent> F <Plug>Sneak_S


" map leader to spacebar
let mapleader = " "


" General REMAPS
" shortcut to yank current line and feed yanked line to <C-R> + 0; Space + R
nnoremap <leader>R yy/<c-r>0<cr>

" shortcut to force quit; Space + cc
nnoremap <leader>cc :q!<cr>
" shortcut to check marks; Space + mm
nnoremap <leader>mm :<C-u>marks<cr>:normal!
" shortcut to remove highlight from search; Space + rr
nnoremap <silent> <leader>rr :noh<cr>
" shortcut to save and quit; Space + ss
nnoremap <leader>ss :x<cr>
" shortcut to force save; Space + ww
nnoremap <leader>ww :w!<cr>
" shortcut to yank all lines to sys clipboard; Space + yy
nnoremap <silent> <leader>yy :%y+<cr>


" BETTER NVIM SPLIT NAVIGATION
" down/up
nnoremap <c-j> <c-w><c-j>
nnoremap <c-k> <c-w><c-k>
" right/left
nnoremap <c-l> <c-w><c-l>
nnoremap <c-h> <c-w><c-h>


" REMAP FOR C++
" shortctu for for loops; Space + ff
nnoremap <leader>ff ofor () {<cr>}<esc>k4la
" load template; Space + T
nnoremap <leader>T :call Meeko()<cr>kdd6jcc
" save and compile cpp being edited; Space + C
autocmd filetype cpp nnoremap <leader>C :w <bar> !g++ -O2 -Wall % -o %:r <cr>


" General Behavior
set tabstop=2 softtabstop=2 shiftwidth=2
set expandtab smarttab autoindent
set incsearch ignorecase smartcase hlsearch
set encoding=utf-8
set textwidth=0
set number
set relativenumber
set title
set scrolloff=15
set clipboard=unnamed,unnamedplus
set guicursor=a:blinkon50
set noswapfile
set nobackup
set nowritebackup
set noundofile
set termguicolors


" plugins
call plug#begin('~/.vim/plugged')

Plug 'dracula/vim', {'as':'dracula'}
Plug 'vim-airline/vim-airline'
Plug 'jiangmiao/auto-pairs'
Plug 'justinmk/vim-sneak'

call plug#end()

" set colorscheme
colorscheme dracula

" theme airline
let g:airline_theme='dracula'
let g:airline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 1


" custom function to load template for competitive programming
function Meeko()
   :read ~/Scripts/cpp/tmp.cpp
endfunction
