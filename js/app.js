/**
 * RAND.AGI - Main Application
 * The AI Slot Machine
 */

const App = {
    currentArchitecture: null,
    currentWeights: null,
    modelName: null,

    // Stats from localStorage
    stats: {
        localGenerations: 0,
        totalWeightsGenerated: 0
    },

    init() {
        this.loadStats();
        this.bindEvents();
        this.updateStatsDisplay();
    },

    loadStats() {
        const saved = localStorage.getItem('randagi_stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    },

    saveStats() {
        localStorage.setItem('randagi_stats', JSON.stringify(this.stats));
    },

    bindEvents() {
        const leverBtn = document.getElementById('pull-lever');
        leverBtn.addEventListener('click', () => this.pullLever());

        document.getElementById('download-model').addEventListener('click', () => this.downloadModel());
    },

    pullLever() {
        const leverBtn = document.getElementById('pull-lever');
        if (Animations.isSpinning) return;

        // Disable button during spin
        leverBtn.disabled = true;
        leverBtn.querySelector('.lever-text').textContent = 'GENERATING...';

        // Hide download section and retract ticket during generation
        document.getElementById('download-section').style.display = 'none';
        document.getElementById('prize-ticket').classList.remove('revealed');

        // Generate the network FIRST so we know what to display
        this.currentArchitecture = NetworkGenerator.generateArchitecture();
        this.modelName = NetworkGenerator.generateModelName(this.currentArchitecture);
        this.currentWeights = NetworkGenerator.generateWeights(this.currentArchitecture.total_parameters);

        // Prepare final values for the reels
        const finalValues = {
            arch: this.currentArchitecture.architecture,
            layers: this.currentArchitecture.num_layers.toString(),
            params: NetworkGenerator.formatParams(this.currentArchitecture.total_parameters)
        };

        // Start spinning animation with predetermined final values
        Animations.startSpin(finalValues, () => {
            // Update the rest of the UI after animation completes
            this.finishGeneration();

            // Re-enable button
            leverBtn.disabled = false;
            leverBtn.querySelector('.lever-text').textContent = 'PULL TO GENERATE';
        });
    },

    finishGeneration() {
        // Update UI
        this.updateResultPanel();

        // Reveal the prize ticket
        this.revealPrizeTicket();

        // Update stats
        this.stats.localGenerations++;
        this.stats.totalWeightsGenerated += this.currentWeights.actualParams;
        this.saveStats();
        this.updateStatsDisplay();

        // Celebration!
        Animations.launchConfetti(50);
        Animations.pulseResult();
        Animations.shake();

        // Check for "jackpot" (large models or special architectures)
        if (this.currentArchitecture.total_parameters > 1e9 ||
            this.currentArchitecture.architecture === 'HYBRID') {
            Animations.triggerJackpot();
        }

        // Show download section
        document.getElementById('download-section').style.display = 'flex';
    },

    revealPrizeTicket() {
        const ticket = document.getElementById('prize-ticket');
        const ticketName = document.getElementById('ticket-name');
        const ticketParams = document.getElementById('ticket-params');

        // Set the content
        ticketName.textContent = this.modelName;
        ticketParams.textContent = `${NetworkGenerator.formatParams(this.currentArchitecture.total_parameters)} parameters`;

        // Reveal with animation
        ticket.classList.add('revealed');
    },

    updateResultPanel() {
        const arch = this.currentArchitecture;

        // Stats
        document.getElementById('stat-arch').textContent = arch.architecture_name;
        document.getElementById('stat-layers').textContent = arch.num_layers.toLocaleString();
        document.getElementById('stat-params').textContent = NetworkGenerator.formatParams(arch.total_parameters);

        // Get unique activations used
        const activations = [...new Set(arch.layers.map(l => l.activation).filter(a => a !== 'none'))];
        document.getElementById('stat-activations').textContent = activations.slice(0, 3).join(', ');

        // AGI probability
        document.getElementById('agi-prob').textContent = arch.metadata.probability_of_agi;
    },

    updateStatsDisplay() {
        const localCount = document.getElementById('local-count');
        const totalWeights = document.getElementById('total-weights');

        Animations.animateNumber(localCount, this.stats.localGenerations, 500);
        Animations.animateNumber(totalWeights, this.stats.totalWeightsGenerated, 800);
    },

    async downloadModel() {
        if (!this.currentArchitecture || !this.currentWeights) return;

        const zip = new JSZip();

        // Add model.json
        const json = NetworkGenerator.createModelJSON(this.currentArchitecture);
        zip.file('model.json', json);

        // Add weights.bin with header
        const header = new TextEncoder().encode(
            `RANDAGI_WEIGHTS_V1\n` +
            `model: ${this.modelName}\n` +
            `total_params: ${this.currentArchitecture.total_parameters}\n` +
            `actual_params: ${this.currentWeights.actualParams}\n` +
            `truncated: ${this.currentWeights.truncated}\n` +
            `dtype: float32\n` +
            `---\n`
        );
        const weightsBlob = NetworkGenerator.createWeightsBinary(this.currentWeights);
        const combinedWeights = new Blob([header, weightsBlob]);
        zip.file('weights.bin', combinedWeights);

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadBlob(zipBlob, `${this.modelName}.zip`);
    },

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
