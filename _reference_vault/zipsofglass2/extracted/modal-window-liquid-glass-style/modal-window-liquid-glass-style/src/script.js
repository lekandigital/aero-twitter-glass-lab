const openBtn = document.getElementById("open-modal");
const overlay = document.getElementById("modal-overlay");
const closeBtn = document.getElementById("modal-close");
const modal = overlay.querySelector(".modal");

const backdrop = modal.querySelector(".modal-backdrop");
const foreground = modal.querySelector(".modal-foreground");

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const openModal = () => {
    overlay.hidden = false;
    overlay.classList.add("show");
    document.body.classList.add("modal-open");
    modal.focus();
};

const closeModal = () => {
    overlay.classList.remove("show");
    document.body.classList.remove("modal-open");
    setTimeout(() => {
        overlay.hidden = true;
    }, 300);
};

document.addEventListener("DOMContentLoaded", () => {
    openBtn.addEventListener("click", openModal);

    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    if (!isTouchDevice) {
        document.addEventListener("mousemove", (e) => {
            const { innerWidth, innerHeight } = window;
            const offsetX = ((e.clientX / innerWidth) - 0.5) * 10;
            const offsetY = ((e.clientY / innerHeight) - 0.5) * 10;

            modal.style.transform = `translate(${offsetX * 10}px, ${offsetY * 10}px) scale(1)`;
            backdrop.style.transform = `translate(${offsetX * 14}px, ${offsetY * 14}px)`;
        });
    }
});