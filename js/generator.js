/**
 * RAND.AGI Neural Network Generator
 * Generates random (but valid!) neural network architecture and weights
 */

const NetworkGenerator = {
    // Architecture types with their layer patterns
    architectures: {
        MLP: {
            name: 'Multi-Layer Perceptron',
            layerTypes: ['dense'],
            minLayers: 1,
            maxLayers: 100
        },
        CNN: {
            name: 'Convolutional Neural Network',
            layerTypes: ['conv2d', 'conv2d', 'maxpool', 'batchnorm'],
            minLayers: 3,
            maxLayers: 50
        },
        RNN: {
            name: 'Recurrent Neural Network',
            layerTypes: ['lstm', 'gru'],
            minLayers: 1,
            maxLayers: 20
        },
        TRANSFORMER: {
            name: 'Transformer',
            layerTypes: ['attention', 'feedforward', 'layernorm'],
            minLayers: 2,
            maxLayers: 96
        },
        GAN: {
            name: 'Generative Adversarial Network',
            layerTypes: ['dense', 'dense', 'batchnorm'],
            minLayers: 4,
            maxLayers: 30
        },
        VAE: {
            name: 'Variational Autoencoder',
            layerTypes: ['dense', 'dense'],
            minLayers: 4,
            maxLayers: 20
        },
        DIFFUSION: {
            name: 'Diffusion Model',
            layerTypes: ['conv2d', 'conv2d', 'attention', 'groupnorm'],
            minLayers: 10,
            maxLayers: 60
        },
        HYBRID: {
            name: 'Mysterious Hybrid Architecture',
            layerTypes: ['dense', 'dense', 'attention'],
            minLayers: 5,
            maxLayers: 50
        }
    },

    activations: ['relu', 'gelu', 'silu', 'tanh', 'sigmoid', 'leaky_relu', 'elu', 'swish', 'mish'],

    // Generate a random architecture
    generateArchitecture() {
        const archKeys = Object.keys(this.architectures);
        const archKey = archKeys[Math.floor(Math.random() * archKeys.length)];
        const arch = this.architectures[archKey];

        // Random number of layers
        const numLayers = Math.floor(Math.random() * (arch.maxLayers - arch.minLayers + 1)) + arch.minLayers;

        // Generate layers
        const layers = [];
        let inputShape = this.randomInputShape(archKey);
        let currentShape = [...inputShape];
        let totalParams = 0;

        for (let i = 0; i < numLayers; i++) {
            const layerType = arch.layerTypes[Math.floor(Math.random() * arch.layerTypes.length)];
            const layer = this.generateLayer(layerType, currentShape, i, numLayers, archKey);

            // Validate layer
            if (layer && layer.params >= 0 && !isNaN(layer.params)) {
                layers.push(layer);
                currentShape = [...layer.output_shape];
                totalParams += layer.params;
            }
        }

        // Flatten if needed before output
        if (currentShape.length > 1) {
            const flatSize = currentShape.reduce((a, b) => a * b, 1);
            currentShape = [flatSize];
        }

        // Add output layer
        const outputLayer = this.generateOutputLayer(currentShape);
        layers.push(outputLayer);
        totalParams += outputLayer.params;

        // Ensure we have valid params
        if (isNaN(totalParams) || totalParams <= 0) {
            totalParams = Math.floor(Math.random() * 1000000) + 1000;
        }

        return {
            format: 'rand_agi_v1',
            version: '1.0.0',
            generated_at: new Date().toISOString(),
            architecture: archKey,
            architecture_name: arch.name,
            input_shape: inputShape,
            output_shape: outputLayer.output_shape,
            num_layers: layers.length,
            total_parameters: totalParams,
            layers: layers,
            metadata: {
                generator: 'RAND.AGI Slot Machine',
                theory: 'Infinite Monkey Theorem',
                probability_of_agi: this.calculateAGIProbability(totalParams)
            }
        };
    },

    randomInputShape(archKey) {
        if (['CNN', 'DIFFUSION'].includes(archKey)) {
            // Image-like input
            const sizes = [28, 32, 64, 128, 224, 256];
            const channels = [1, 3, 4];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            return [size, size, channels[Math.floor(Math.random() * channels.length)]];
        } else if (['RNN'].includes(archKey)) {
            // Sequence input
            const seqLens = [32, 64, 128, 256, 512];
            const embedDims = [64, 128, 256, 512, 768];
            return [seqLens[Math.floor(Math.random() * seqLens.length)],
                    embedDims[Math.floor(Math.random() * embedDims.length)]];
        } else if (['TRANSFORMER'].includes(archKey)) {
            // Transformer sequence input
            const seqLens = [128, 256, 512, 1024, 2048, 4096];
            const embedDims = [256, 512, 768, 1024, 2048, 4096];
            return [seqLens[Math.floor(Math.random() * seqLens.length)],
                    embedDims[Math.floor(Math.random() * embedDims.length)]];
        } else {
            // Vector input for MLP, GAN, VAE, HYBRID
            const dims = [64, 128, 256, 512, 784, 1024, 2048, 4096];
            return [dims[Math.floor(Math.random() * dims.length)]];
        }
    },

    generateLayer(type, inputShape, layerIndex, totalLayers, archKey) {
        const activation = this.activations[Math.floor(Math.random() * this.activations.length)];
        let layer = {
            index: layerIndex,
            type: type,
            activation: activation
        };

        // Get input dimension safely
        const getLastDim = (shape) => {
            if (!shape || shape.length === 0) return 256;
            return shape[shape.length - 1] || 256;
        };

        const getFlatSize = (shape) => {
            if (!shape || shape.length === 0) return 256;
            return shape.reduce((a, b) => (a || 1) * (b || 1), 1);
        };

        switch (type) {
            case 'dense': {
                const units = Math.pow(2, Math.floor(Math.random() * 10) + 4); // 16 to 8192
                const flatInput = getFlatSize(inputShape);
                layer.units = units;
                layer.input_shape = inputShape;
                layer.output_shape = [units];
                layer.params = flatInput * units + units;
                break;
            }

            case 'conv2d': {
                // Ensure we have 3D input for conv
                let h = inputShape[0] || 32;
                let w = inputShape[1] || 32;
                let c = inputShape[2] || 3;

                const filters = Math.pow(2, Math.floor(Math.random() * 6) + 3); // 8 to 256
                const kernelSize = [3, 3];
                layer.filters = filters;
                layer.kernel_size = kernelSize;
                layer.stride = [1, 1];
                layer.padding = 'same';
                layer.input_shape = [h, w, c];
                layer.output_shape = [h, w, filters];
                layer.params = kernelSize[0] * kernelSize[1] * c * filters + filters;
                break;
            }

            case 'maxpool': {
                let h = inputShape[0] || 32;
                let w = inputShape[1] || 32;
                let c = inputShape[2] || 64;

                // Don't pool if already too small
                if (h < 4 || w < 4) {
                    layer.type = 'identity';
                    layer.input_shape = inputShape;
                    layer.output_shape = inputShape;
                    layer.params = 0;
                } else {
                    layer.pool_size = [2, 2];
                    layer.input_shape = [h, w, c];
                    layer.output_shape = [Math.floor(h / 2), Math.floor(w / 2), c];
                    layer.params = 0;
                }
                layer.activation = 'none';
                break;
            }

            case 'lstm':
            case 'gru': {
                const seqLen = inputShape[0] || 128;
                const inputDim = getLastDim(inputShape);
                const hiddenUnits = Math.pow(2, Math.floor(Math.random() * 7) + 5); // 32 to 2048
                const multiplier = type === 'lstm' ? 4 : 3;
                layer.units = hiddenUnits;
                layer.return_sequences = Math.random() > 0.5;
                layer.input_shape = [seqLen, inputDim];
                layer.output_shape = layer.return_sequences ? [seqLen, hiddenUnits] : [hiddenUnits];
                layer.params = multiplier * ((inputDim + hiddenUnits) * hiddenUnits + hiddenUnits);
                break;
            }

            case 'attention': {
                const seqLen = inputShape[0] || 512;
                const embedDim = getLastDim(inputShape);
                const numHeads = [1, 2, 4, 8, 12, 16, 32][Math.floor(Math.random() * 7)];
                const headDim = Math.floor(embedDim / numHeads) || 64;
                layer.num_heads = numHeads;
                layer.head_dim = headDim;
                layer.input_shape = [seqLen, embedDim];
                layer.output_shape = [seqLen, embedDim];
                // Q, K, V, O projections
                layer.params = 4 * embedDim * embedDim;
                break;
            }

            case 'feedforward': {
                const seqLen = inputShape[0] || 512;
                const embedDim = getLastDim(inputShape);
                const ffDim = embedDim * 4;
                layer.ff_dim = ffDim;
                layer.input_shape = [seqLen, embedDim];
                layer.output_shape = [seqLen, embedDim];
                layer.params = 2 * embedDim * ffDim + ffDim + embedDim;
                break;
            }

            case 'layernorm':
            case 'batchnorm':
            case 'groupnorm': {
                const lastDim = getLastDim(inputShape);
                layer.input_shape = inputShape;
                layer.output_shape = [...inputShape];
                layer.params = 2 * lastDim;
                layer.activation = 'none';
                break;
            }

            default:
                layer.input_shape = inputShape;
                layer.output_shape = [...inputShape];
                layer.params = 0;
        }

        return layer;
    },

    generateOutputLayer(inputShape) {
        const outputSizes = [2, 10, 100, 1000, 10000, 32000, 50257, 128256];
        const outputSize = outputSizes[Math.floor(Math.random() * outputSizes.length)];
        const flatInput = inputShape.reduce((a, b) => (a || 1) * (b || 1), 1);

        return {
            index: -1,
            type: 'output',
            units: outputSize,
            activation: 'softmax',
            input_shape: inputShape,
            output_shape: [outputSize],
            params: flatInput * outputSize + outputSize
        };
    },

    calculateAGIProbability(totalParams) {
        // Each parameter is a float32, so 2^32 possible values per param
        // Probability = 1 / (2^32)^totalParams = 1 / 2^(32*totalParams)
        const exponent = 32 * totalParams;
        if (exponent > 1e15) {
            return `1 in 2^${exponent.toExponential(2)}`;
        }
        return `1 in 2^${exponent.toLocaleString()}`;
    },

    // Generate random weights as binary data
    generateWeights(totalParams) {
        // Limit actual file size for browser memory (max ~10MB of actual weights)
        const maxParams = 2500000; // 10MB / 4 bytes per float32
        const safeTotal = Math.max(1, Math.floor(totalParams) || 10000);
        const actualParams = Math.min(safeTotal, maxParams);

        // Create Float32Array with random weights
        const weights = new Float32Array(actualParams);

        // Initialize with various distributions for "realism"
        for (let i = 0; i < actualParams; i++) {
            // Mix of initialization strategies
            const strategy = Math.random();
            if (strategy < 0.4) {
                // Xavier/Glorot-like
                weights[i] = (Math.random() - 0.5) * 2 * Math.sqrt(6 / 1000);
            } else if (strategy < 0.7) {
                // He initialization-like
                weights[i] = (Math.random() - 0.5) * 2 * Math.sqrt(2 / 500);
            } else if (strategy < 0.9) {
                // Small random
                weights[i] = (Math.random() - 0.5) * 0.1;
            } else {
                // Occasionally larger values
                weights[i] = (Math.random() - 0.5) * 2;
            }
        }

        return {
            data: weights,
            actualParams: actualParams,
            totalParams: safeTotal,
            truncated: safeTotal > maxParams
        };
    },

    // Create downloadable files
    createModelJSON(architecture) {
        return JSON.stringify(architecture, null, 2);
    },

    createWeightsBinary(weights) {
        return new Blob([weights.data.buffer], { type: 'application/octet-stream' });
    },

    // Generate a fun model name
    generateModelName(architecture) {
        const prefixes = ['RAND', 'MONKE', 'LUCKY', 'CHAOS', 'YOLO', 'MAGIC', 'DICE', 'SLOT', 'JACKPOT', 'SPIN', 'WILD', 'GLITCH', 'FUZZY'];
        const suffixes = ['Random', 'Chaos', 'Monkey', 'Lucky', 'Quantum', 'Ultra', 'Mega', 'Hyper', 'Neo', 'Prime', 'Zero', 'Omega'];
        const versions = ['0.1', '1.0', '2.0', '3.5', '4.0', '7', '13', '70', '405'];

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const version = versions[Math.floor(Math.random() * versions.length)];

        const paramStr = this.formatParams(architecture.total_parameters);

        return `${prefix}-${suffix}-${version}-${paramStr}`;
    },

    formatParams(params) {
        if (!params || isNaN(params)) return '???';
        if (params >= 1e12) return (params / 1e12).toFixed(1) + 'T';
        if (params >= 1e9) return (params / 1e9).toFixed(1) + 'B';
        if (params >= 1e6) return (params / 1e6).toFixed(1) + 'M';
        if (params >= 1e3) return (params / 1e3).toFixed(1) + 'K';
        return params.toString();
    }
};
