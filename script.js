/* =========================================================
   BIRTHDAY WEBSITE
   Main JavaScript
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentScreen = "incident-screen";

let currentPhoto = 0;

let deploymentStarted = false;

let finalMessageDeployed = false;


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

/*
 * renderScreen() performs the actual DOM swap ONLY.
 * It never touches browser history. It is used in two
 * situations:
 *   1. After goToScreen() has pushed a new history entry
 *      (normal forward navigation via a button/timer).
 *   2. After a popstate event, where the browser has
 *      already moved the history pointer for us.
 * Keeping the render logic separate from the history
 * logic is what lets back/forward work correctly.
 */
function renderScreen(screenId) {

    const current = document.getElementById(currentScreen);
    const next = document.getElementById(screenId);

    if (!next) {
        console.error("Screen not found:", screenId);
        return;
    }

    if (current) {
        current.classList.remove("active");
    }
    if (screenId === "deployment-screen") {
    resetDeploymentScreen();
}
    /*
     * Small delay gives the browser time to remove
     * the previous screen before showing the next one.
     */
    setTimeout(() => {

        next.classList.add("active");

        currentScreen = screenId;

        if (screenId === "api-screen") {
    resetApiScreen();
}

if (screenId === "final-deploy-screen") {
    resetFinalDeployScreen();
}

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        vibrate(15);

        /*
         * Start deployment animation when entering
         * the deployment screen.
         */
        if (screenId === "deployment-screen") {

            startDeployment();

        }

    }, 80);
}


/*
 * goToScreen() is the ONLY navigation entry point used by
 * every onclick / setTimeout in this file. Each call
 * records a real browser history entry for the screen
 * we're moving to, so the device's physical/browser back
 * button steps back through the birthday flow one screen
 * at a time instead of leaving the page entirely.
 */
function goToScreen(screenId) {

    /*
     * Avoid pushing a duplicate entry if we're already
     * on this screen (e.g. a stray double-call).
     */
    if (screenId === currentScreen) {
        return;
    }

    if (!document.getElementById(screenId)) {
        console.error("Screen not found:", screenId);
        return;
    }

    history.pushState(
        { screen: screenId },
        "",
        location.href
    );

    renderScreen(screenId);
}


/*
 * Fires ONLY when the user presses the browser/device
 * back or forward control. By that point the browser has
 * already moved the history pointer itself, so we must
 * just re-render the screen stored in that history entry —
 * calling goToScreen() (and therefore pushState) here
 * would create an infinite forward/back loop.
 */
window.addEventListener("popstate", function (event) {

    const targetScreen =
        (event.state && event.state.screen)
            ? event.state.screen
            : "incident-screen";

    renderScreen(targetScreen);

});


/* =========================================================
   HAPTIC FEEDBACK
   ========================================================= */

function vibrate(duration = 20) {

    /*
     * Works on supported mobile devices.
     * Does nothing on browsers that don't support it.
     */

    if ("vibrate" in navigator) {

        try {
            navigator.vibrate(duration);
        } catch (error) {
            // Ignore vibration errors.
        }

    }
}


/* =========================================================
   DEBUGGING — WRONG ANSWER
   ========================================================= */

function wrongAnswer(button) {

    vibrate([20, 30, 20]);

    /*
     * Remove previous wrong-selection state.
     */

    document
        .querySelectorAll(".choice-btn")
        .forEach(btn => {
            btn.classList.remove("wrong-selected");
        });


    /*
     * Add shake animation.
     */

    button.classList.add("wrong-selected");


    const result = document.getElementById("debug-result");

    if (result) {

        result.className = "result-message result-error";

        result.innerHTML =
            "Ye sahi kaam kar raha hai.. try something else to fix..";

    }


    /*
     * Remove animation class after it finishes
     * so it can be triggered again.
     */

    setTimeout(() => {

        button.classList.remove("wrong-selected");

    }, 450);

}


/* =========================================================
   DEBUGGING — CORRECT ANSWER
   ========================================================= */

function correctAnswer(button) {

    vibrate([30, 50, 30]);


    /*
     * Remove previous states.
     */

    document
        .querySelectorAll(".choice-btn")
        .forEach(btn => {

            btn.classList.remove(
                "wrong-selected",
                "correct-selected"
            );

        });


    /*
     * Highlight correct answer.
     */

    button.classList.add("correct-selected");


    const result = document.getElementById("debug-result");

    if (result) {

        result.className =
            "result-message result-success";

        result.innerHTML =
            "✅ Hmm... I think I found the problem. 👀! 💖";

    }


    /*
     * Automatically continue after a short delay.
     */

    setTimeout(() => {

        goToScreen("api-screen");

    }, 1300);

}


/* =========================================================
   BIRTHDAY API
   ========================================================= */
function resetApiScreen() {

    const button = document.querySelector(
        "#api-screen .primary-btn"
    );

    const result = document.getElementById("api-result");

    if (button) {
        button.disabled = false;
        button.style.opacity = "1";
        button.innerHTML = "🚀 Send the Request";
    }

    if (result) {
        result.innerHTML = "";
        result.className = "result-message";
    }
}

function testBirthdayApi() {

    const result = document.getElementById("api-result");

    const button = document.querySelector(
        "#api-screen .primary-btn"
    );


    if (!result) {
        return;
    }


    /*
     * Prevent multiple clicks.
     */

    if (button) {
        button.disabled = true;
        button.style.opacity = "0.7";
    }


    vibrate(20);


    /*
     * Fake API request.
     */

    result.className = "result-message";

    result.innerHTML =
        "⏳ Sending request...";


    setTimeout(() => {

        result.innerHTML =
            "⚙️ Processing birthday request...";

    }, 700);


    setTimeout(() => {

        result.className =
            "result-message result-success";

        result.innerHTML =
            "✅ HTTP 200 OK — Birthday request accepted! 🎉";

        vibrate([30, 50, 30]);

    }, 1500);


    /*
     * Move to deployment.
     */

    setTimeout(() => {

        goToScreen("deployment-screen");

    }, 2300);

}


/* =========================================================
   CI/CD DEPLOYMENT
   ========================================================= */

function startDeployment() {

    /*
     * Prevent animation from starting multiple times.
     */

    if (deploymentStarted) {
        return;
    }

    deploymentStarted = true;


    const steps = [
        document.getElementById("step-1"),
        document.getElementById("step-2"),
        document.getElementById("step-3"),
        document.getElementById("step-4")
    ];


    const delays = [
        600,
        1800,
        3000,
        4200
    ];


    steps.forEach((step, index) => {

        if (!step) {
            return;
        }


        setTimeout(() => {

            runPipelineStep(
                step,
                index
            );

        }, delays[index]);

    });


    /*
     * After all deployment steps finish,
     * show final issue screen.
     */

    setTimeout(() => {

        const message =
            document.getElementById(
                "deployment-message"
            );

        if (message) {

            message.className =
                "deployment-message result-success";

            message.innerHTML =
                "almost! Kuch der aur!";

        }

    }, 5200);


    setTimeout(() => {

        goToScreen("final-deploy-screen");

    }, 6200);

}


/* =========================================================
   PIPELINE STEP
   ========================================================= */

function runPipelineStep(step, index) {

    step.classList.add("running");


    const smallText =
        step.querySelector(
            ".pipeline-content small"
        );

    const status =
        step.querySelector(
            ".pipeline-status"
        );


    if (smallText) {

        smallText.textContent =
            "Running...";

    }


    if (status) {

        status.textContent =
            "◌";

    }


    vibrate(15);


    /*
     * Simulate processing.
     */

    setTimeout(() => {

        step.classList.remove("running");

        step.classList.add("success");


        if (smallText) {

            smallText.textContent =
                "Completed";

        }


        if (status) {

            status.textContent =
                "✓";

        }


        vibrate(25);

    }, 750);

}


/* =========================================================
   FINAL MESSAGE DEPLOYMENT
   ========================================================= */
function resetFinalDeployScreen() {

    finalMessageDeployed = false;

    const button = document.querySelector(
        "#final-deploy-screen .primary-btn"
    );

    if (button) {
        button.disabled = false;
        button.style.opacity = "1";
        button.innerHTML = "❤️ Deploy the Message";
    }
}

function deployFinalMessage() {

    if (finalMessageDeployed) {
        return;
    }

    finalMessageDeployed = true;


    vibrate([
        40,
        60,
        40,
        60,
        80
    ]);


    /*
     * Small delay before reveal creates suspense.
     */

    const button =
        document.querySelector(
            "#final-deploy-screen .primary-btn"
        );


    if (button) {

        button.disabled = true;

        button.innerHTML =
            "🚀 Deploying...";

        button.style.opacity = "0.75";

    }


    setTimeout(() => {

        if (button) {

            button.innerHTML =
                "✨ Deployment Complete";

        }

    }, 900);


    setTimeout(() => {

        goToScreen("birthday-screen");

    }, 1500);


    /*
     * Start celebration slightly after
     * the birthday screen appears.
     */

    setTimeout(() => {

        launchConfetti();

        createFloatingHearts();

        vibrate([
            50,
            80,
            50
        ]);

    }, 1900);

}


/* =========================================================
   CONFETTI
   ========================================================= */

function launchConfetti() {

    const container =
        document.getElementById(
            "confetti-container"
        );


    if (!container) {
        return;
    }


    /*
     * Remove old confetti.
     */

    container.innerHTML = "";


    const pieces = 90;


    for (let i = 0; i < pieces; i++) {

        const piece =
            document.createElement("div");


        piece.className = "confetti";


        /*
         * Random horizontal position.
         */

        piece.style.left =
            Math.random() * 100 + "%";


        /*
         * Random animation duration.
         */

        piece.style.animationDuration =
            (2.5 + Math.random() * 2) + "s";


        /*
         * Random delay.
         */

        piece.style.animationDelay =
            Math.random() * 1.2 + "s";


        /*
         * Random size.
         */

        const width =
            5 + Math.random() * 7;

        const height =
            8 + Math.random() * 10;


        piece.style.width =
            width + "px";

        piece.style.height =
            height + "px";


        /*
         * Random shape.
         */

        piece.style.borderRadius =
            Math.random() > 0.5
                ? "50%"
                : "2px";


        /*
         * We deliberately use CSS variables
         * instead of hardcoding one visual style.
         */

        const confettiColors = [
            "#ff79ad",
            "#a77cff",
            "#ffc46b",
            "#82d8b0",
            "#ff91c8",
            "#8ec5ff"
        ];


        piece.style.background =
            confettiColors[
                Math.floor(
                    Math.random() *
                    confettiColors.length
                )
            ];


        container.appendChild(piece);

    }


    /*
     * Remove confetti after animation.
     */

    setTimeout(() => {

        container.innerHTML = "";

    }, 6000);

}


/* =========================================================
   FLOATING HEARTS DURING REVEAL
   ========================================================= */

function createFloatingHearts() {

    const heartSymbols = [
        "💖",
        "💕",
        "💗",
        "💓",
        "✨"
    ];


    for (let i = 0; i < 18; i++) {

        const heart =
            document.createElement("div");


        heart.textContent =
            heartSymbols[
                Math.floor(
                    Math.random() *
                    heartSymbols.length
                )
            ];


        heart.style.position =
            "fixed";


        heart.style.left =
            Math.random() * 100 + "%";


        heart.style.bottom =
            "-30px";


        heart.style.fontSize =
            (14 + Math.random() * 18) + "px";


        heart.style.zIndex =
            "99";


        heart.style.pointerEvents =
            "none";


        heart.style.opacity =
            "0.8";


        heart.style.transition =
            "transform 4s ease-out, opacity 4s ease-out";


        document.body.appendChild(heart);


        /*
         * Start animation after browser
         * paints the element.
         */

        requestAnimationFrame(() => {

            heart.style.transform =
                `translateY(-${window.innerHeight + 100}px)
                 translateX(${(Math.random() - 0.5) * 100}px)
                 rotate(${Math.random() * 360}deg)`;

            heart.style.opacity = "0";

        });


        setTimeout(() => {

            heart.remove();

        }, 4500);

    }

}


/* =========================================================
   PHOTO CAROUSEL
   ========================================================= */

const photoTrack =
    document.querySelector(".photo-track");

const photoCards =
    document.querySelectorAll(".photo-card");

const photoCarousel =
    document.querySelector(".photo-carousel");


/*
 * We have exactly 2 photos.
 */

const totalPhotos =
    photoCards.length;


/* =========================================================
   SHOW PHOTO
   ========================================================= */

function showPhoto(index) {

    if (!photoTrack || totalPhotos === 0) {
        return;
    }


    /*
     * Keep index inside valid range.
     */

    if (index < 0) {
        index = 0;
    }

    if (index >= totalPhotos) {
        index = totalPhotos - 1;
    }


    currentPhoto = index;


    photoTrack.style.transform =
        `translateX(-${currentPhoto * 100}%)`;


    vibrate(10);

}


/* =========================================================
   TOUCH SWIPE
   ========================================================= */

let touchStartX = 0;

let touchEndX = 0;


if (photoCarousel) {

    photoCarousel.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

        },
        {
            passive: true
        }
    );


    photoCarousel.addEventListener(
        "touchend",
        function (event) {

            touchEndX =
                event.changedTouches[0].clientX;


            handleSwipe();

        },
        {
            passive: true
        }
    );

}


function handleSwipe() {

    const distance =
        touchEndX - touchStartX;


    /*
     * Ignore tiny movements.
     */

    if (Math.abs(distance) < 50) {
        return;
    }


    /*
     * Swipe left → next image.
     */

    if (distance < 0) {

        if (currentPhoto < totalPhotos - 1) {

            showPhoto(currentPhoto + 1);

        }

    }


    /*
     * Swipe right → previous image.
     */

    else {

        if (currentPhoto > 0) {

            showPhoto(currentPhoto - 1);

        }

    }

}


/* =========================================================
   DOUBLE TAP PREVENTION
   ========================================================= */

let lastTouchTime = 0;


document.addEventListener(
    "touchend",
    function (event) {

        const currentTime =
            new Date().getTime();


        const tapLength =
            currentTime - lastTouchTime;


        if (tapLength < 300 &&
            tapLength > 0) {

            event.preventDefault();

        }


        lastTouchTime =
            currentTime;

    },
    {
        passive: false
    }
);


/* =========================================================
   RESTART EXPERIENCE
   ========================================================= */

function restartExperience() {

    /*
     * Restarting is itself a forward navigation, so it
     * gets its own history entry — pressing back right
     * after a restart takes the user to the final message
     * screen they restarted from, one step at a time.
     */

    history.pushState(
        { screen: "incident-screen" },
        "",
        location.href
    );


    /*
     * Reset variables.
     */

    currentScreen =
        "incident-screen";

    currentPhoto = 0;

    deploymentStarted = false;

    finalMessageDeployed = false;


    /*
     * Reset all screens.
     */

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });


    const firstScreen =
        document.getElementById(
            "incident-screen"
        );


    if (firstScreen) {

        firstScreen.classList.add("active");

    }


    /*
     * Reset debug buttons.
     */

    document
        .querySelectorAll(".choice-btn")
        .forEach(button => {

            button.classList.remove(
                "wrong-selected",
                "correct-selected"
            );

        });


    /*
     * Clear result messages.
     */

    const debugResult =
        document.getElementById(
            "debug-result"
        );

    if (debugResult) {

        debugResult.innerHTML = "";

        debugResult.className =
            "result-message";

    }


    const apiResult =
        document.getElementById(
            "api-result"
        );

    if (apiResult) {

        apiResult.innerHTML = "";

        apiResult.className =
            "result-message";

    }


    /*
     * Reset API button.
     */

    const apiButton =
        document.querySelector(
            "#api-screen .primary-btn"
        );


    if (apiButton) {

        apiButton.disabled = false;

        apiButton.style.opacity = "1";

        apiButton.innerHTML =
            "🚀 Send Birthday Request";

    }


    /*
     * Reset final deploy button.
     */

    const finalButton =
        document.querySelector(
            "#final-deploy-screen .primary-btn"
        );


    if (finalButton) {

        finalButton.disabled = false;

        finalButton.style.opacity = "1";

        finalButton.innerHTML =
            "❤️ Deploy Final Message";

    }


    /*
     * Reset pipeline.
     */

    document
        .querySelectorAll(".pipeline-step")
        .forEach(step => {

            step.classList.remove(
                "running",
                "success"
            );


            const small =
                step.querySelector(
                    ".pipeline-content small"
                );

            const status =
                step.querySelector(
                    ".pipeline-status"
                );


            if (small) {
                small.textContent =
                    "Waiting...";
            }


            if (status) {
                status.textContent =
                    "○";
            }

        });


    /*
     * Reset photo carousel.
     */

    if (photoTrack) {

        photoTrack.style.transform =
            "translateX(0)";

    }


    /*
     * Remove confetti.
     */

    const confetti =
        document.getElementById(
            "confetti-container"
        );


    if (confetti) {

        confetti.innerHTML = "";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    vibrate(20);

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Make sure the first screen is active.
         */

        const firstScreen =
            document.getElementById(
                "incident-screen"
            );


        if (firstScreen) {

            firstScreen.classList.add("active");

        }


        /*
         * Seed the very first history entry so it carries
         * our screen state. Using replaceState (not
         * pushState) means we don't add an extra step
         * before the page the user actually arrived from.
         */

        history.replaceState(
            { screen: "incident-screen" },
            "",
            location.href
        );


        /*
         * Start photo carousel at first image.
         */

        showPhoto(0);


        console.log(
            "🎂 BirthdayService initialized successfully."
        );

        console.log(
            "🚀 Status: Ready for deployment."
        );

    }
);

function resetDeploymentScreen() {

    deploymentStarted = false;

    document
        .querySelectorAll(".pipeline-step")
        .forEach(step => {

            step.classList.remove(
                "running",
                "success"
            );

            const small =
                step.querySelector(
                    ".pipeline-content small"
                );

            const status =
                step.querySelector(
                    ".pipeline-status"
                );

            if (small) {
                small.textContent = "Waiting...";
            }

            if (status) {
                status.textContent = "○";
            }

        });

    const message =
        document.getElementById("deployment-message");

    if (message) {
        message.innerHTML = "";
        message.className = "deployment-message";
    }
}