# RAND.AGI - The AI Slot Machine

A tongue-in-cheek web app that generates completely random neural networks, playing on the infinite monkey theorem. Pull the lever and maybe—just maybe—you'll randomly generate AGI.

(Spoiler: You won't.)

## How It Works

1. **Pull the lever** - Watch the slot machine spin through architectures, layer counts, and parameter sizes
2. **Get your model** - A prize ticket pops up with your randomly generated neural network
3. **Download it** - Get a zip file containing:
   - `model.json` - Valid neural network architecture specification
   - `weights.bin` - Binary file of random Float32 weights

## Features

- **8 Architecture Types**: MLP, CNN, RNN, Transformer, GAN, VAE, Diffusion, and mysterious Hybrid networks
- **Real Model Files**: Downloads are actually valid neural network specifications that could theoretically be loaded
- **Fun Model Names**: Every model gets a unique name like "MONKE-Quantum-3.5-1.2M" or "YOLO-Prime-70-500K"
- **Vegas Aesthetic**: Neon lights, spinning reels, confetti explosions, and prize ticket animations
- **AGI Probability**: See the exact odds that your random weights happen to be AGI (hint: it's a very big number)

## The Math

Each parameter in a neural network is a 32-bit float, giving 2^32 possible values per parameter. For a model with N parameters, the probability of randomly hitting any specific configuration is:

```
1 in 2^(32 × N)
```

For a modest 1M parameter model, that's 1 in 2^32,000,000. Good luck!

## Running Locally

Just open `index.html` in your browser. No build step, no dependencies, no server required.

## Tech Stack

- Vanilla HTML/CSS/JS
- [JSZip](https://stuk.github.io/jszip/) for creating downloadable zip files
- Pure CSS animations and effects

## License

MIT - Go wild, generate some AGI.
