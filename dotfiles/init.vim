" map leader to spacebar
let mapleader = " "

" general remaps
" shortcut to yank current line and feed yanked line to <C-R> + 0; Space + yr
nnoremap <leader>yr yy/<c-r>0<cr>

" paste last yanked
nnoremap <leader>pp "0p

" shortcut to remove highlight from search; Space + rr
nnoremap <silent> <leader>rr :noh<cr>

" shortcut to yank all lines to sys clipboard; Space + yy
nnoremap <silent> <leader>yy :%y+<cr>

" ctrl + d + zz
nnoremap <silent> <C-d> <C-d>zz

" ctrl + u + zz
nnoremap <silent> <C-u> <C-u>zz

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
call plug#end()

" set theme
colorscheme dracula

" set theme for 'vim-airline' plugin
let g:airline_theme='dracula'
let g:airline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 1

" auto remove trailing whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

