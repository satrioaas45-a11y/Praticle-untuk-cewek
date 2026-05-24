const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const countdownEl = document.getElementById('countdown');
const btnSatukan = document.getElementById('btnSatukan'); 
const btnApa = document.getElementById('btnApa'); 
const btnJadi = document.getElementById('btnJadi'); 
const btnGroupFinal = document.getElementById('btnGroupFinal'); 
const btnTolak = document.getElementById('btnTolak'); 
const btnTerima = document.getElementById('btnTerima'); 

// Tambahan Elemen Baru
const btnKlik = document.getElementById('btnKlik'); 
const customAlert = document.getElementById('customAlert'); 
const btnCloseAlert = document.getElementById('btnCloseAlert'); 
const alertText = document.getElementById('alertText'); // Mengambil text alert
const clickHint = document.getElementById('clickHint');

let width, height;
let particles = [];

// Konfigurasi Utama
const config = {
    text1: "Hai Cantik",
    text2: "aku mau jujur|ke kamu nih...", 
    text3: "Sebenernya aku ada|rasa ke kamu",
    text4: "kamu mau|jadi pacar aku?",
    textFinal: "Makasih yah|cantik", // Teks Akhir

    fontFamily: "Poppins",
    particleColor: "rgba(255, 105, 180, 0.9)", 
    glowColor: "rgba(255, 0, 127, 1)",        
    
    timeToGather: 500 
};

// State Animasi
let isGathering = false;
let isExploding = false; 
let globalGlow = 0;
let glowDirection = 1;

// State Fitur Klik
let canClick = false; 
let isCountingDown = false;
let phase = 1; 

// 1. Setup Canvas & Responsivitas Teks
function setCanvasSize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    if (width < 768) { // Mobile
        config.fontSize1 = 50;
        config.fontSize2 = 32; 
        config.fontSize3 = 32; 
        config.fontSize4 = 40; 
        config.particleRadius = 1.0;
        config.gap = 3;
    } else { // Desktop
        config.fontSize1 = 120;
        config.fontSize2 = 65; 
        config.fontSize3 = 65; 
        config.fontSize4 = 90; 
        config.particleRadius = 1.5;
        config.gap = 4;
    }
}

// 2. Partikel Object
class Particle {
    constructor(x, y) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.targetX = x;
        this.targetY = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = config.particleRadius;
    }
    draw() {
        ctx.fillStyle = config.particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        if (isExploding) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.98;
            this.vy *= 0.98;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        } else if (!isGathering) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        } else {
            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;
            this.x += dx * 0.05;
            this.y += dy * 0.05;
            this.x += (Math.random() - 0.5) * 0.5;
            this.y += (Math.random() - 0.5) * 0.5;
        }
    }
}

// 3. Mesin Pencari Koordinat Teks
function getPoints(text, fontSize) {
    ctx.fillStyle = "white";
    ctx.font = `600 ${fontSize}px ${config.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.clearRect(0, 0, width, height);

    let lines = text.split('|');
    let lineHeight = fontSize * 1.5;
    let startY = (height - (lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line.trim(), width / 2, startY + (index * lineHeight));
    });

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    ctx.clearRect(0, 0, width, height);

    let points = [];
    for (let y = 0; y < height; y += config.gap) {
        for (let x = 0; x < width; x += config.gap) {
            const index = (y * width + x) * 4;
            const alpha = pixels[index + 3];
            if (alpha > 128) points.push({x, y});
        }
    }
    return points;
}

function formText(text, fontSize) {
    let newPoints = getPoints(text, fontSize);
    newPoints.sort(() => Math.random() - 0.5);

    if (particles.length < newPoints.length) {
        let diff = newPoints.length - particles.length;
        for(let i = 0; i < diff; i++) {
            particles.push(new Particle(0,0));
        }
    } else if (particles.length > newPoints.length) {
        particles.splice(newPoints.length);
    }

    for(let i = 0; i < particles.length; i++) {
        particles[i].targetX = newPoints[i].x;
        particles[i].targetY = newPoints[i].y;
    }
}

function formHeart() {
    let points = [];
    let scale = width < 768 ? 10 : 16; 
    let centerX = width / 2;
    let centerY = height / 2 - 20; 
    
    for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)); 
        
        points.push({
            x: centerX + x * scale,
            y: centerY + y * scale
        });
    }

    points.sort(() => Math.random() - 0.5);

    for(let i = 0; i < particles.length; i++) {
        let pt = points[i % points.length]; 
        particles[i].targetX = pt.x;
        particles[i].targetY = pt.y;
    }
}

// 4. Loop Animasi
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    if (isGathering) {
        globalGlow += 0.5 * glowDirection;
        if (globalGlow > 20 || globalGlow < 0) glowDirection *= -1;
        ctx.shadowBlur = 10 + globalGlow;
        ctx.shadowColor = config.glowColor;
    } else {
        ctx.shadowBlur = (isExploding) ? 5 : 0; 
    }

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
}

// 5. Logika Hitung Mundur
function startCountdown() {
    isCountingDown = true;
    let count = 5;
    
    canvas.style.opacity = "0.15";
    countdownEl.style.display = "block";
    countdownEl.innerText = count;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.innerText = count;
        } else {
            clearInterval(interval);
            countdownEl.style.display = "none";
            canvas.style.opacity = "1"; 
            
            isGathering = false;
            isExploding = true;
            phase = 2;
            
            particles.forEach(p => {
                let angle = Math.random() * Math.PI * 2;
                let speed = Math.random() * 15 + 5; 
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
            });

            setTimeout(() => {
                btnSatukan.style.display = "block";
            }, 500);
        }
    }, 1000);
}

// 6. Event Listeners Navigasi
btnSatukan.addEventListener('click', () => {
    btnSatukan.style.display = "none"; 
    isExploding = false; 
    formText(config.text2, config.fontSize2);
    isGathering = true;
    phase = 3;
    setTimeout(() => { btnApa.style.display = "block"; }, 2500);
});

btnApa.addEventListener('click', () => {
    btnApa.style.display = "none"; 
    formText(config.text3, config.fontSize3);
    phase = 4; 
    setTimeout(() => { btnJadi.style.display = "block"; }, 2500);
});

btnJadi.addEventListener('click', () => {
    btnJadi.style.display = "none"; 
    formText(config.text4, config.fontSize4);
    phase = 5; 
    setTimeout(() => { btnGroupFinal.style.display = "flex"; }, 3000); 
});

// --- LOGIKA TOMBOL PILIHAN (GA MAU / IYA MAU) ---

// Logika "Ga Mau" 
btnTolak.addEventListener('click', () => {
    alertText.innerText = "kamu nolak aku tapi Jangan lupa chat aku yah 😁";
    customAlert.classList.add('show');
});

// Logika "Iya Mau" 
btnTerima.addEventListener('click', () => {
    btnGroupFinal.style.display = "none"; 
    customAlert.classList.remove('show'); 
    
    // Partikel membentuk Love outline
    formHeart();
    phase = 6;

    // Tunggu 4 detik, ubah jadi "Makasih yah cantik"
    setTimeout(() => {
        formText(config.textFinal, config.fontSize4);
        phase = 7;

        // Jeda 2.5 detik lalu munculkan tombol "Klik"
        setTimeout(() => {
            btnKlik.style.display = "block";
        }, 2500);

    }, 4000);
});

// --- LOGIKA TOMBOL KLIK (AKHIR) ---
btnKlik.addEventListener('click', () => {
    btnKlik.style.display = "none"; // Sembunyikan tombol setelah diklik
    alertText.innerText = "iya saya mau, jangan lupa chat aku yah😁"; // Ubah teks sesuai permintaan
    customAlert.classList.add('show');
});

// Logika Tutup Alert
btnCloseAlert.addEventListener('click', () => {
    customAlert.classList.remove('show');
});
// 7. Inisialisasi Pertama
function init() {
    setCanvasSize();
    formText(config.text1, config.fontSize1);
    animate();
    setTimeout(() => {
        isGathering = true;
        setTimeout(() => { 
            canClick = true; 
            clickHint.style.display = "block"; // Tambahkan baris ini untuk memunculkan teks
        }, 2000); 
    }, config.timeToGather);
}



window.addEventListener('load', init);
window.addEventListener('resize', () => { location.reload(); });

window.addEventListener('click', (e) => {
    // Memastikan klik di area mana pun (kecuali tombol) akan memicu awal animasi
    if (canClick && !isCountingDown && phase === 1 && 
        e.target !== btnSatukan && e.target !== btnApa && 
        e.target !== btnJadi && e.target !== btnKlik && 
        e.target.parentNode !== btnGroupFinal && 
        !customAlert.contains(e.target)) { 
        
        clickHint.style.display = "none"; // Tambahkan baris ini untuk menyembunyikan teks
        startCountdown();
    }
});




