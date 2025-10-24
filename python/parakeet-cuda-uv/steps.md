```
uv init
```

```
uv venv
```

```
.venv\Scripts\activate
```

```
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu126
```


### Test if CUDA is available
```
uv run python
```
then input the code below
```
import torch
print(torch.cuda.is_available())
```

#### If it says "True", then we have CUDA on our virtual environment.

```
exit()
```

### Install
```
uv add flask requests sounddevice soundfile numpy scipy pyperclip keyboard "nemo_toolkit["asr"]<=2.5.0" "cuda-python>=12.3"
```