const fs = require('fs');
const { createCanvas } = require('canvas');

// Generate icons for both active and inactive states
function generateIcons() {
    const sizes = [16, 48, 128];
    const states = ['', '-active'];

    // Create icons directory if it doesn't exist
    if (!fs.existsSync('./icons')) {
        fs.mkdirSync('./icons');
    }

    states.forEach(state => {
        sizes.forEach(size => {
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = state === '-active' ? '#2563eb' : '#475569';
            ctx.fillRect(0, 0, size, size);

            // Robot face (simplified)
            const scale = size / 128;
            ctx.fillStyle = '#ffffff';

            // Head
            ctx.fillRect(
                size * 0.25,
                size * 0.2,
                size * 0.5,
                size * 0.6
            );

            // Antenna
            ctx.fillRect(
                size * 0.45,
                size * 0.1,
                size * 0.1,
                size * 0.1
            );

            // Eyes
            ctx.fillStyle = state === '-active' ? '#2563eb' : '#475569';
            ctx.fillRect(
                size * 0.35,
                size * 0.35,
                size * 0.1,
                size * 0.1
            );
            ctx.fillRect(
                size * 0.55,
                size * 0.35,
                size * 0.1,
                size * 0.1
            );

            // Save the icon
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(`./icons/icon${size}${state}.png`, buffer);
        });
    });
}

generateIcons();
