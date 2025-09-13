import sounddevice as sd

# List all devices available for input/output
devices = sd.query_devices()

# Print all device details
for idx, device in enumerate(devices):
    print(f"Device {idx}: {device['name']}")
    print(f"  - Input Channels: {device['max_input_channels']}")
    print(f"  - Output Channels: {device['max_output_channels']}")
    print(f"  - Default Sample Rate: {device['default_samplerate']}")
    print("-" * 40)

