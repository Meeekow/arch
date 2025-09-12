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
