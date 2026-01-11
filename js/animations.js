/**
 * RAND.AGI Animations
 * Slot machine spinning, confetti, and celebration effects
 */

const Animations = {
    isSpinning: false,
    spinIntervals: {},

    // Reel data for spinning display
    reels: {
        arch: ['MLP', 'CNN', 'RNN', 'TRANSFORMER', 'GAN', 'VAE', 'DIFFUSION', 'HYBRID'],
        layers: ['1', '3', '12', '24', '48', '96', '128', '1000+'],
        params: ['1K', '100K', '1M', '100M', '1B', '7B', '70B', '1T+']
    },

    // Start spinning animation with pre-determined final values
    startSpin(finalValues, callback) {
        if (this.isSpinning) return;
        this.isSpinning = true;

        const reelArch = document.getElementById('reel-arch');
        const reelLayers = document.getElementById('reel-layers');
        const reelParams = document.getElementById('reel-params');

        // Start all reels spinning
        this.startReelSpin(reelArch, 'arch');
        this.startReelSpin(reelLayers, 'layers');
        this.startReelSpin(reelParams, 'params');

        // Base spin duration
        const baseDuration = 1500 + Math.random() * 1000;

        // Stop reel 1 (architecture)
        setTimeout(() => {
            this.stopReelSpin(reelArch, 'arch', finalValues.arch);
        }, baseDuration);

        // Stop reel 2 (layers) - 400ms later
        setTimeout(() => {
            this.stopReelSpin(reelLayers, 'layers', finalValues.layers);
        }, baseDuration + 400);

        // Stop reel 3 (params) - 800ms later, then callback
        setTimeout(() => {
            this.stopReelSpin(reelParams, 'params', finalValues.params);
            this.isSpinning = false;
            if (callback) callback();
        }, baseDuration + 800);
    },

    startReelSpin(reel, reelType) {
        reel.classList.add('spinning');

        // Rapidly change values during spin
        this.spinIntervals[reelType] = setInterval(() => {
            const values = this.reels[reelType];
            const item = reel.querySelector('.reel-item');
            item.textContent = values[Math.floor(Math.random() * values.length)];
        }, 80);
    },

    stopReelSpin(reel, reelType, finalValue) {
        // Stop the random value changes
        clearInterval(this.spinIntervals[reelType]);

        // Remove spinning class
        reel.classList.remove('spinning');

        // Set the final value
        const item = reel.querySelector('.reel-item');
        item.textContent = finalValue;

        // Add a "landed" effect
        item.style.animation = 'none';
        item.offsetHeight; // Trigger reflow
        item.style.animation = 'glow-pulse 0.5s ease';
    },

    // Confetti explosion!
    launchConfetti(count = 100) {
        const container = document.getElementById('confetti');
        const colors = ['#ff2d95', '#00f3ff', '#39ff14', '#fff01f', '#bf00ff', '#ffd700'];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = (Math.random() * 10 + 5) + 'px';
                confetti.style.height = (Math.random() * 10 + 5) + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';

                const duration = Math.random() * 2 + 2;
                const rotation = Math.random() * 720 - 360;
                const drift = Math.random() * 200 - 100;

                confetti.style.animation = `confetti-fall ${duration}s ease-out forwards`;
                confetti.style.setProperty('--drift', drift + 'px');
                confetti.style.setProperty('--rotation', rotation + 'deg');

                container.appendChild(confetti);

                // Remove after animation
                setTimeout(() => confetti.remove(), duration * 1000);
            }, i * 20);
        }

        // Add the CSS animation dynamically if not exists
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confetti-fall {
                    0% {
                        opacity: 1;
                        transform: translateY(-10vh) translateX(0) rotate(0deg);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(100vh) translateX(var(--drift)) rotate(var(--rotation));
                    }
                }
                @keyframes glow-pulse {
                    0%, 100% { text-shadow: 0 0 10px currentColor; }
                    50% { text-shadow: 0 0 30px currentColor, 0 0 50px currentColor; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Jackpot animation for "special" results
    triggerJackpot() {
        const machine = document.querySelector('.slot-machine');
        machine.classList.add('jackpot');

        // Extra confetti for jackpot
        this.launchConfetti(200);

        // Remove after 3 seconds
        setTimeout(() => {
            machine.classList.remove('jackpot');
        }, 3000);
    },

    // Screen shake effect
    shake() {
        const container = document.querySelector('.container');
        container.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);

        if (!document.getElementById('shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Pulse effect on result panel
    pulseResult() {
        const panel = document.getElementById('result-panel');
        panel.style.animation = 'result-pulse 0.5s ease';
        setTimeout(() => {
            panel.style.animation = '';
        }, 500);

        if (!document.getElementById('pulse-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-style';
            style.textContent = `
                @keyframes result-pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 20px rgba(0, 243, 255, 0.2);
                    }
                    50% {
                        transform: scale(1.02);
                        box-shadow: 0 0 40px rgba(0, 243, 255, 0.5);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Number counting animation
    animateNumber(element, target, duration = 1000) {
        const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
};
