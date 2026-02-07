export class AssetPreloader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.images = [];
        this.audio = [];
    }

    preloadImages(imagePaths) {
        return Promise.all(
            imagePaths.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        this.loadedAssets++;
                        this.updateProgress();
                        resolve(img);
                    };
                    img.onerror = reject;
                    img.src = src;
                    this.images.push(img);
                });
            })
        );
    }

    preloadAudio(audioPaths) {
        return Promise.all(
            audioPaths.map(src => {
                return new Promise((resolve, reject) => {
                    const audio = new Audio();
                    audio.oncanplaythrough = () => {
                        this.loadedAssets++;
                        this.updateProgress();
                        resolve(audio);
                    };
                    audio.onerror = reject;
                    audio.src = src;
                    this.audio.push(audio);
                });
            })
        );
    }

    async loadAll(imagePaths, audioPaths) {
        this.totalAssets = imagePaths.length + audioPaths.length;

        try {
            await Promise.all([
                this.preloadImages(imagePaths),
                this.preloadAudio(audioPaths)
            ]);
            return true;
        } catch (error) {
            console.error('Asset loading failed:', error);
            return false;
        }
    }

    updateProgress() {
        const percent = Math.floor((this.loadedAssets / this.totalAssets) * 100);
        const progressBar = document.getElementById('load-progress');
        const progressText = document.getElementById('load-percent');

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;
    }
}
