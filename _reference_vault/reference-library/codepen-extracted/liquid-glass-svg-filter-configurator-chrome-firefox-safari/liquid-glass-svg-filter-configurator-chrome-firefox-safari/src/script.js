const baseFrequencyH = document.querySelector("#baseFrequencyH");
const baseFrequencyV = document.querySelector("#baseFrequencyV");
const numOctaves = document.querySelector("#numOctaves");
const seed = document.querySelector("#seed");
const stitch = document.querySelector("#stitch");
const liquidGlassFilter = document.querySelector("#liquid-glass-filter");
const feTurbulence = liquidGlassFilter.querySelector("feTurbulence");
const feGaussianBlur = liquidGlassFilter.querySelector("feGaussianBlur");
const feDisplacementMap = liquidGlassFilter.querySelector("feDisplacementMap");
const liquidButton = document.querySelector("#liquidButton");
const background = document.querySelector("#background");
const buttonColor = document.querySelector("#buttonColor");
const buttonWidth = document.querySelector("#buttonWidth");
const buttonHeight = document.querySelector("#buttonHeight");
const type = document.querySelector("#type");
const textarea = document.querySelector("#textarea");
const rangeInputs = document.querySelectorAll('input[type="range"]');

const config = {
    baseFrequency: "0 0",
    numOctaves: 0,
    seed: 1,
    stitch: false,
    type: "fractalNoise",
    stdDeviation: "0 0",
    scale: 1,
    xChannelSelector: "R",
    yChannelSelector: "R"
};

function handleInputChange(e) {
    e.target.style.backgroundSize = `${
        ((e.target.value - e.target.min) * 100) / (e.target.max - e.target.min)
    }% 100%`;
}

function setBackground(data) {
    if (data.includes(".mp4")) {
        document.querySelector(
            ".background"
        ).innerHTML = `<video src="${data}" muted loop autoplay></video>`;
    } else {
        document.querySelector(
            ".background"
        ).innerHTML = `<img src="${data}" alt="">`;
    }
}

function setButtonColor(color) {
    liquidButton.style.color = color;
}

function updateSVG() {
    document.body
        .querySelectorAll("input, select:not(#background)")
        .forEach((input) => {
            if (input.id === "baseFrequencyH") {
                config["baseFrequency"] = `${input.value}`;
            } else if (input.id === "baseFrequencyV") {
                config[
                    "baseFrequency"
                ] = `${config["baseFrequency"]} ${input.value}`;
            } else if (input.id === "stdDeviationH") {
                config["stdDeviation"] = `${input.value}`;
            } else if (input.id === "stdDeviationV") {
                config[
                    "stdDeviation"
                ] = `${config["stdDeviation"]} ${input.value}`;
            } else {
                config[`${input.id}`] = `${input.value}`;
            }
        });
    textarea.textContent = `<svg><filter id="liquid-glass-filter" x="0%" y="0%" width="100%" height="100%"><feTurbulence baseFrequency="${config.baseFrequency}" numOctaves="${config.numOctaves}" seed="${config.seed}" stitchTiles="${config.stitch}" type="${config.type}" result="noise"></feTurbulence><feGaussianBlur in="noise" stdDeviation="${config.stdDeviation}" result="blurred"></feGaussianBlur><feDisplacementMap in="SourceGraphic" in2="blurred" scale="${config.scale}" xChannelSelector="${config.xChannelSelector}" yChannelSelector="${config.yChannelSelector}"></feDisplacementMap></filter></svg>`;
}

function grabElement(element) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;

    function elementDrag(event) {
        event = event || window.event;

        event.preventDefault();
        pos1 = pos3 - event.clientX;
        pos2 = pos4 - event.clientY;
        pos3 = event.clientX;
        pos4 = event.clientY;

        element.style.top = `${element.offsetTop - pos2}px`;
        element.style.left = `${element.offsetLeft - pos1}px`;
    }

    function closeDragElement() {
        document.removeEventListener("mousemove", elementDrag);
        document.removeEventListener("mouseup", closeDragElement);
    }

    function dragMouseDown(event) {
        event = event || window.event;
        event.preventDefault();

        pos3 = event.clientX;
        pos4 = event.clientY;

        document.addEventListener("mousemove", elementDrag);
        document.addEventListener("mouseup", closeDragElement);
    }

    element.addEventListener("mousedown", dragMouseDown);
}

background.addEventListener("change", (e) => setBackground(e.target.value));

buttonColor.addEventListener("change", (e) => {
    setButtonColor(e.target.value);
});

buttonWidth.addEventListener("input", (e) => {
    buttonWidth.parentNode.querySelector(".value").textContent = e.target.value;
    liquidButton.style.width = `${e.target.value}px`;
});

buttonHeight.addEventListener("input", (e) => {
    buttonHeight.parentNode.querySelector(".value").textContent = e.target.value;
    liquidButton.style.height = `${e.target.value}px`;
});

baseFrequencyH.addEventListener("input", (e) => {
    baseFrequencyH.parentNode.querySelector(".value").textContent =
        e.target.value;
    const v = feTurbulence.getAttribute("baseFrequency").split(" ")[1];
    feTurbulence.setAttribute("baseFrequency", `${e.target.value} ${v}`);
    updateSVG();
});

baseFrequencyV.addEventListener("input", (e) => {
    baseFrequencyV.parentNode.querySelector(".value").textContent =
        e.target.value;
    const h = feTurbulence.getAttribute("baseFrequency").split(" ")[0];
    feTurbulence.setAttribute("baseFrequency", `${h} ${e.target.value}`);
    updateSVG();
});

numOctaves.addEventListener("input", (e) => {
    numOctaves.parentNode.querySelector(".value").textContent = e.target.value;
    feTurbulence.setAttribute("numOctaves", e.target.value);
    updateSVG();
});

seed.addEventListener("input", (e) => {
    seed.parentNode.querySelector(".value").textContent = e.target.value;
    feTurbulence.setAttribute("seed", e.target.value);
    updateSVG();
});

stitch.addEventListener("change", (e) => {
    feTurbulence.setAttribute("stitchTiles", e.target.value);
    updateSVG();
});

type.addEventListener("change", (e) => {
    feTurbulence.setAttribute("type", e.target.value);
    updateSVG();
});

stdDeviationH.addEventListener("input", (e) => {
    stdDeviationH.parentNode.querySelector(".value").textContent =
        e.target.value;
    const v = feGaussianBlur.getAttribute("stdDeviation").split(" ")[1];
    feGaussianBlur.setAttribute("stdDeviation", `${e.target.value} ${v}`);
    updateSVG();
});

stdDeviationV.addEventListener("input", (e) => {
    stdDeviationV.parentNode.querySelector(".value").textContent =
        e.target.value;
    const h = feGaussianBlur.getAttribute("stdDeviation").split(" ")[0];
    feGaussianBlur.setAttribute("stdDeviation", `${h} ${e.target.value}`);
    updateSVG();
});

scale.addEventListener("input", (e) => {
    scale.parentNode.querySelector(".value").textContent = e.target.value;
    feDisplacementMap.setAttribute("scale", e.target.value);
    updateSVG();
});

seed.addEventListener("input", (e) => {
    seed.parentNode.querySelector(".value").textContent = e.target.value;
    feTurbulence.setAttribute("seed", e.target.value);
    updateSVG();
});

xChannelSelector.addEventListener("change", (e) => {
    feDisplacementMap.setAttribute("xChannelSelector", e.target.value);
    updateSVG();
});

yChannelSelector.addEventListener("change", (e) => {
    feDisplacementMap.setAttribute("yChannelSelector", e.target.value);
    updateSVG();
});

rangeInputs.forEach((input) => {
    input.addEventListener("input", handleInputChange);
});

grabElement(liquidButton);
setBackground(background.options[0].value);
setButtonColor(buttonColor.options[0].value);
updateSVG();
