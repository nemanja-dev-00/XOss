document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('patternCanvas');
    const ctx = canvas.getContext('2d');

    // Configurable variables
    const size = 15; // SVG size
    const gap = 5; // Gap between SVGs

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    const elements = [];
    let animatingElement = null; // Track the currently animating element

    // Load SVGs
    const svgX = new Image();
    const svgO = new Image();
    svgX.src = 'data:image/svg+xml;base64,' + btoa(`<svg width="${size}" height="${size}" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 13.75L1 1.25" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M1 13.75L13.5 1.25" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`);
    svgO.src = 'data:image/svg+xml;base64,' + btoa(`<svg width="${size}" height="${size}" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7.5" cy="7.5" r="6.5" transform="rotate(-180 7.5 7.5)" stroke="white" stroke-width="2"/></svg>`);

    svgX.onload = svgO.onload = function() {
        drawPattern();
        animatePattern();
    };

    function drawPattern() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        elements.length = 0; // Clear elements array

        const cols = Math.floor(canvas.width / (size + gap));
        const rows = Math.floor(canvas.height / (size + gap));

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * (size + gap);
                const y = row * (size + gap);
                const isX = (row + col) % 2 === 0; // Alternate between X and O
                const svg = isX ? svgX : svgO;

                ctx.globalAlpha = 0.2;
                ctx.drawImage(svg, x, y, size, size); // Draw SVG

                elements.push({ x, y, svg }); // Add to elements array
            }
        }
    }

    function getAnimationInterval() {
        return 150; // Interval to select and animate the element
    }

    function animatePattern() {
        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * elements.length);
            const element = elements[randomIndex];

            // Mark the element as animating
            animatingElement = element;

            // Start the fade in/out animation
            fadeInOut(element, 1000, () => {
                // Clear the animating element when done
                animatingElement = null;
            });
        }, getAnimationInterval());
    }

    function fadeInOut(element, duration, onComplete) {
        const steps = 20;
        const interval = duration / steps;
        let currentStep = 0;

        function fade(step) {
            ctx.clearRect(element.x, element.y, size, size); // Clear the old position

            const opacity = Math.sin((step / steps) * Math.PI); // Smooth transition
            ctx.globalAlpha = opacity;
            ctx.drawImage(element.svg, element.x, element.y, size, size);

            if (step < steps) {
                setTimeout(() => fade(step + 1), interval);
            } else {
                ctx.clearRect(element.x, element.y, size, size); // Clear the bright position
                ctx.globalAlpha = 0.2;
                ctx.drawImage(element.svg, element.x, element.y, size, size);
                onComplete(); // Call the onComplete callback when finished
            }
        }

        fade(currentStep);
    }

    // Redraw pattern on window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawPattern();
    });

    // Initial canvas setup
    resizeCanvas();
});