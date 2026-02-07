// SVG Assets
export const ASSETS = {
    nenek: {
        standing: `<img src="assets/img/nenek1.webp" width="150" height="180" style="display:block;">`,
        jumping: `<img src="assets/img/nenek2.webp" width="150" height="180" style="display:block;">`
    },
    obstacles: [
        { html: `<img src="assets/img/lubang.webp" width="50" height="20" style="display:block;">`, w: 50, h: 20 },
        { html: `<img src="assets/img/batu.webp" width="40" height="30" style="display:block;">`, w: 40, h: 30 },
        { html: `<img src="assets/img/hydrant.webp" width="70" height="90" style="display:block;">`, w: 70, h: 90 },
        { id: 'cat', html: `<img src="assets/img/kucing1.webp" width="50" height="40" style="display:block;">`, hitHtml: `<img src="assets/img/kucing2.webp" width="50" height="40" style="display:block;">`, w: 50, h: 40 }
    ],
    items: [
        { id: 'apple', html: `<img src="assets/img/apple.webp" width="30" height="30" style="display:block;">`, points: 10, type: 'good', y: 47 },
        { id: 'orange', html: `<img src="assets/img/jeruk.webp" width="30" height="30" style="display:block;">`, points: 10, type: 'good', y: 52 },
        { id: 'cherry', html: `<img src="assets/img/cherry.webp" width="30" height="30" style="display:block;">`, points: 15, type: 'good', y: 57 },
        { id: 'banana', html: `<img src="assets/img/banana.webp" width="50" height="30" style="display:block;">`, points: 0, type: 'bad', y: 22 }
    ],
    audio: {
        bgm: [
            'assets/audio/backsound1.mp3',
            'assets/audio/backsounde2.mp3'
        ],
        collect: 'assets/audio/items.wav',
        hit: [
            'assets/audio/aduh1.wav',
            'assets/audio/aduh2.wav',
            'assets/audio/aduh3.wav',
            'assets/audio/aduh4.wav'
        ],
        slip: 'assets/audio/pisang.wav',
        gameover: 'assets/audio/gameover.wav',
        jump: [
            'assets/audio/loncat1.mp3',
            'assets/audio/loncat2.mp3',
            'assets/audio/loncat3.mp3'
        ],
        cat: 'assets/audio/cat.mp3'
    },
    pedestrians: [
        'assets/img/pedestrian1.webp',
        'assets/img/pedestrian2.webp',
        'assets/img/pedestrian3.webp'
    ]
};

export function createPedestrianSVG() {
    return `
    <svg viewBox="0 0 40 80" width="40" height="80">
        <circle cx="20" cy="15" r="8" fill="#2d3436" />
        <rect x="12" y="25" width="16" height="30" rx="4" fill="#341f97" />
        <rect x="12" y="55" width="6" height="20" fill="#2d3436" />
        <rect x="22" y="55" width="6" height="20" fill="#2d3436" />
    </svg>`;
}

export function createGerobakSVG(isBakso) {
    return isBakso ? `
    <svg viewBox="0 0 100 80" width="100" height="80">
        <rect x="10" y="20" width="70" height="40" fill="#0984e3" />
        <rect x="10" y="10" width="70" height="10" fill="#dfe6e9" />
        <circle cx="25" cy="70" r="8" fill="#2d3436" />
        <circle cx="65" cy="70" r="8" fill="#2d3436" />
        <text x="45" y="45" font-family="Arial" font-size="10" fill="white" text-anchor="middle">BAKSO</text>
    </svg>` : `
    <svg viewBox="0 0 100 80" width="100" height="80">
        <rect x="10" y="20" width="70" height="40" fill="#e17055" />
        <rect x="5" y="15" width="80" height="5" fill="#636e72" />
        <circle cx="30" cy="70" r="8" fill="#2d3436" />
        <circle cx="60" cy="70" r="8" fill="#2d3436" />
        <text x="45" y="45" font-family="Arial" font-size="8" fill="white" text-anchor="middle">GORENGAN</text>
    </svg>`;
}
