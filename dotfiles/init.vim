" enable vim sneak
let g:sneak#label = 1

" rebinded 'f' and 'F' for vim sneak
nmap <silent> f <Plug>Sneak_s
nmap <silent> F <Plug>Sneak_S

" map leader to spacebar
let mapleader = " "

" general remaps
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

" better nvim split navigation
" down/up
nnoremap <c-j> <c-w><c-j>
nnoremap <c-k> <c-w><c-k>
" left/right
nnoremap <c-h> <c-w><c-h>
nnoremap <c-l> <c-w><c-l>

" remap for C++
" shortcut for for loops; Space + ff
nnoremap <leader>ff ofor () {<cr>}<esc>k4la
" load template; Space + T
nnoremap <leader>T :call Meeko()<cr>kdd6jcc
" save and compile current *.cpp in buffer; Space + C
autocmd filetype cpp nnoremap <leader>C :w <bar> !g++ -O2 -Wall % -o %:r <cr>

" nvim behavior
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

" set theme
colorscheme dracula

" set theme for 'vim-airline' plugin
let g:airline_theme='dracula'
let g:airline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 1

" auto remove trailing whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

" custom function; load template for cp
function Meeko()
   :read ~/Scripts/cpp/tmp.cpp
endfunction
