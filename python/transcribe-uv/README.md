# Install hf cli
```
uv pip install -U "huggingface_hub[cli]"
```

# Delete models from HuggingFace
```
uv run hf cache delete
```

# Install PyTorch for 1050 Ti
```
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu126
```

# Installing cuda on Debian
1. Go to this [link](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/).
2. Go to section "2.1 System Requirements"
3. Follow the link to the "CUDA Toolkit".
4. A new page will be opened, follow the instructions on that page.
5. Get the path of your CUDA so we can add it on our PATH.
```
cd /usr/local/
```
6. Update `.bashrc`
```
export PATH="$PATH:/usr/local/cuda-13.0"
export PATH="$PATH:/usr/local/cuda-13.0/bin"
export LI_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/cuda-13.0/lib64"
```
7. Source the `.bashrc`
```
source ~/.bashrc
```
