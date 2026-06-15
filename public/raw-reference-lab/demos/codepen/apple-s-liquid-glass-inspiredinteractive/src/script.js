const glass = document.getElementById("glass");
let isDragging = false, offsetX, offsetY;

// Function to start dragging
function startDrag(event) {
    isDragging = true;
    const touch = event.touches ? event.touches[0] : event;
    offsetX = touch.clientX - glass.offsetLeft;
    offsetY = touch.clientY - glass.offsetTop;
}

// Function to move the glass
function moveGlass(event) {
    if (isDragging) {
        const touch = event.touches ? event.touches[0] : event;
        glass.style.left = `${touch.clientX - offsetX}px`;
        glass.style.top = `${touch.clientY - offsetY}px`;
    }
}

// Function to stop dragging
function stopDrag() {
    isDragging = false;
}

// Add event listeners for mouse + touch interactions
glass.addEventListener("mousedown", startDrag);
glass.addEventListener("mousemove", moveGlass);
glass.addEventListener("mouseup", stopDrag);

glass.addEventListener("touchstart", startDrag);
glass.addEventListener("touchmove", moveGlass);
glass.addEventListener("touchend", stopDrag);
