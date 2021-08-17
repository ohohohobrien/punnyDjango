window.onload = init;

const urlOfPage = window.location.href;
let idOfPunGlobal = "";

function init() {

    getIdOfPun();

    const checkIfPageObject = window.localStorage.getItem(urlOfPage);
    //console.log(checkIfPageObject);
    if (!checkIfPageObject) {
        window.localStorage.setItem(urlOfPage, JSON.stringify({"buttonType": "", "votesCast": 0}));
    }
    //console.log(checkIfPageObject);

    const reviewButtonGood = document.getElementById('reviewButtonGood');
    const reviewButtonOk = document.getElementById('reviewButtonOk');
    const reviewButtonBad = document.getElementById('reviewButtonBad');

    const reviewButtonGoodValue = document.getElementById('reviewButtonGood-value');
    const reviewButtonOkValue = document.getElementById('reviewButtonOk-value');
    const reviewButtonBadValue = document.getElementById('reviewButtonBad-value');

    const darkToggle = document.getElementById('toggleB');
    darkToggle.addEventListener('input', () => {
        if (darkToggle.checked === true) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            document.getElementsByTagName('meta')["theme-color"].content = "#1F2937";
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            document.getElementsByTagName('meta')["theme-color"].content = "#FBBF24";
        }
    })

    // recommended Tailwind JS to control dark and light themes
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        darkToggle.checked = true;
        document.getElementsByTagName('meta')["theme-color"].content = "#1F2937";
    } else {
        document.documentElement.classList.remove('dark');
        darkToggle.checked = false;
        document.getElementsByTagName('meta')["theme-color"].content = "#FBBF24";
    }
    
    reviewButtonGood.addEventListener('click', () => {stopAnimateClass(reviewButtonGood)});
    reviewButtonOk.addEventListener('click', () => {stopAnimateClass(reviewButtonOk)});
    reviewButtonBad.addEventListener('click', () => {stopAnimateClass(reviewButtonBad)});
    
    reviewButtonGoodValue.addEventListener('animationend', (e) => {
        handleAnimationStateNumberChange(e.target);
    });

    reviewButtonOkValue.addEventListener('animationend', (e) => {
        handleAnimationStateNumberChange(e.target);
    });

    reviewButtonBadValue.addEventListener('animationend', (e) => {
        handleAnimationStateNumberChange(e.target);
    });
    
    loadListenersForExplanationText();

    setInitialNumberStyle();
}

function getIdOfPun() {
    const url = window.location.href;

    let idOfPun = url.split("/");
    if (idOfPun[idOfPun.length - 1].length === 0) {
        idOfPun = idOfPun[idOfPun.length - 2];
    } else {
        idOfPun = idOfPun[idOfPun.length - 1];
    }

    /*
    console.log("found id of the following:");
    console.log(idOfPun);
    console.log("use me for the other pages");
    */

    idOfPunGlobal = idOfPun;
}

function stopAnimateClass(button) {
    const reviewButtonGood = document.getElementById('reviewButtonGood');
    const reviewButtonOk = document.getElementById('reviewButtonOk');
    const reviewButtonBad = document.getElementById('reviewButtonBad');
    const reviewButtonGoodValue = document.getElementById('reviewButtonGood-value');
    const reviewButtonOkValue = document.getElementById('reviewButtonOk-value');
    const reviewButtonBadValue = document.getElementById('reviewButtonBad-value');

    disableButtons();

    let localStorageData = JSON.parse(window.localStorage.getItem(urlOfPage));

    let votesCast = parseInt(localStorageData["votesCast"]); 
    //console.log(votesCast);
    if (!votesCast) {
        votesCast = 0;
        localStorageData["votesCast"] = votesCast;
        window.localStorage.setItem(urlOfPage, JSON.stringify(localStorageData));
    }

    // prevent user from voting too many times on single pun
    if (votesCast > 10) {
        document.getElementById('preventVoteCaseError').style.display = "block";
        // style the text to prevent overlap
        if (localStorageData["buttonType"] !== "reviewButtonGood-value") {
            reviewButtonGoodValue.classList.remove("text-blue-400", "font-bold", "dark:text-yellow-400");
        }
        if (localStorageData["buttonType"] !== "reviewButtonOk-value") {
            reviewButtonOkValue.classList.remove("text-blue-400", "font-bold", "dark:text-yellow-400");
        }
        if (localStorageData["buttonType"] !== "reviewButtonBad-value") {
            reviewButtonBadValue.classList.remove("text-blue-400", "font-bold", "dark:text-yellow-400");
        }
    } else {

        const valueToUpdate = document.getElementById(`${button.id}-value`);
        const alreadyAnimating = button.classList.contains("animate-spin");

        // remove number if animating - GOOD BUTTON
        //if (reviewButtonGood.classList.contains('animate-spin')) reviewButtonGoodValue.innerHTML = (parseInt(reviewButtonGoodValue.innerHTML.toString()) - 1).toString();

        reviewButtonGood.classList.remove('animate-spin'); 
        reviewButtonGood.classList.add('hover:scale-125');  
        reviewButtonGood.classList.add('transform');
        reviewButtonGood.classList.add('transition');
        reviewButtonGood.classList.add('duration-500');
        reviewButtonGood.classList.add('text-shadow-lg');

        if (reviewButtonGoodValue.dataset.animationState === "3") reviewButtonGoodValue.classList.add('numberTextGoUpReverse');

        // remove number if animating
        //if (reviewButtonOk.classList.contains('animate-spin')) reviewButtonOkValue.innerHTML = (parseInt(reviewButtonOkValue.innerHTML.toString()) - 1).toString();

        reviewButtonOk.classList.remove('animate-spin');
        reviewButtonOk.classList.add('hover:scale-125');
        reviewButtonOk.classList.add('transform');
        reviewButtonOk.classList.add('transition');
        reviewButtonOk.classList.add('duration-500');
        reviewButtonOk.classList.add('text-shadow-lg');

        if (reviewButtonOkValue.dataset.animationState === "3") reviewButtonOkValue.classList.add('numberTextGoUpReverse');

        // remove number if animating
        //if (reviewButtonBad.classList.contains('animate-spin')) reviewButtonBadValue.innerHTML = (parseInt(reviewButtonBadValue.innerHTML.toString()) - 1).toString();

        reviewButtonBad.classList.remove('animate-spin');
        reviewButtonBad.classList.add('hover:scale-125');
        reviewButtonBad.classList.add('transform');
        reviewButtonBad.classList.add('transition');
        reviewButtonBad.classList.add('duration-500');
        reviewButtonBad.classList.add('text-shadow-lg');

        if (reviewButtonBadValue.dataset.animationState === "3") reviewButtonBadValue.classList.add('numberTextGoUpReverse');

        if (alreadyAnimating) {
            //console.log("does contain - stop animation");
            button.classList.remove('animate-spin'); 
            button.classList.add('hover:scale-125');  
            button.classList.add('transform');
            button.classList.add('transition');
            button.classList.add('duration-500');
            button.classList.add('text-shadow-lg');
            
        } else {
            //console.log("does not contain");
            button.classList.remove('hover:scale-125'); 
            button.classList.remove('transform');
            button.classList.remove('transition');
            button.classList.remove('duration-500');
            button.classList.remove('text-shadow-lg');
            button.classList.add('animate-spin');

            // animate the number increase

            valueToUpdate.dataset.animationState = "1";
            valueToUpdate.classList.add('numberTextGoDown');
            //console.log("commence animation");
        }

        
        if (reviewButtonGoodValue.dataset.animationState === "3") reviewButtonGoodValue.classList.add('numberTextGoUpReverse');
        if (reviewButtonOkValue.dataset.animationState === "3") reviewButtonOkValue.classList.add('numberTextGoUpReverse');
        if (reviewButtonBadValue.dataset.animationState === "3") reviewButtonBadValue.classList.add('numberTextGoUpReverse');
    }
}

function handleAnimationStateNumberChange(element) {

    let localStorageData = JSON.parse(window.localStorage.getItem(urlOfPage));

    let votesCast = parseInt(localStorageData["votesCast"]); 
    //console.log(votesCast);
    if (!votesCast) {
        votesCast = 0;
        localStorageData["votesCast"] = votesCast;
        window.localStorage.setItem(urlOfPage, JSON.stringify(localStorageData));
    }

    // prevent user from voting too many times on single pun
    if (votesCast > 10) {
        document.getElementById('preventVoteCaseError').style.display = "block";
        // style the text to prevent overlap
        //console.log(localStorageData["buttonType"]);
        
        if (localStorageData["buttonType"] !== "reviewButtonGood-value") {
            document.getElementById("reviewButtonGood-value").classList.remove("text-blue-400", "font-bold", "dark:text-yellow-400");
        }
        if (localStorageData["buttonType"] !== "reviewButtonOk-value") {
            document.getElementById("reviewButtonOk-value").classList.remove("text-blue-400", "font-bold", "dark:text-yellow-400");
        }
        if (localStorageData["buttonType"] !== "reviewButtonBad-value") {
            document.getElementById("reviewButtonBad-value").classList.remove("text-blue-400", "font-bold", "dark:text-yellow-400");
        }
    } else {
        // if user has voted less that 5 times, they can continue to vote
        const animationState = element.dataset.animationState;
    
        if (animationState === "4") {
    
            // animation finish
            element.classList.remove('numberTextGoDownReverse');
            delete element.dataset.animationState;
            if ((localStorageData["buttonType"]) === element.id) {
                delete localStorageData["buttonType"];
                window.localStorage.setItem(urlOfPage, JSON.stringify(localStorageData));
            }
            enableButtons();
    
        }
    
        if (animationState === "3") {
    
            // animation start
            disableButtons();
            element.innerHTML = (parseInt(element.innerHTML.toString()) - 1).toString();
            element.classList.add('numberTextGoDownReverse');
            element.dataset.animationState = "4";
            element.classList.remove('numberTextGoUpReverse');
            element.classList.remove("text-blue-400", "font-bold", "dark:text-yellow-400");
    
            //console.log(idOfPunGlobal);

            // control the fetch request
            const data = JSON.stringify({
                direction: "down",
                button: element.id,
                pkHashed: window.location.href.slice(window.location.href.length - 8),
                pkForTesting: idOfPunGlobal,
            })
            
            let csrftoken = getCookie('csrftoken');
            let response = fetch("/vote", {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    "X-CSRFToken": csrftoken },
            })
    
        }
    
        if (animationState === "2") {
    
            // animation finish
            element.classList.remove('numberTextGoUp');
            element.dataset.animationState = "3";
            enableButtons();
    
        }
    
        if (animationState === "1") {
    
            // animation start
            disableButtons();
            element.innerHTML = (parseInt(element.innerHTML.toString()) + 1).toString();
            element.classList.add('numberTextGoUp');
            element.dataset.animationState = "2";
            element.classList.remove('numberTextGoDown');
            element.classList.add("text-blue-400", "font-bold", "dark:text-yellow-400");
            localStorageData["buttonType"] = element.id;
            window.localStorage.setItem(urlOfPage, JSON.stringify(localStorageData));
    
            // control the fetch request
            const data = JSON.stringify({
                direction: "up",
                button: element.id,
                pkForTesting: idOfPunGlobal,
            })
            
            let csrftoken = getCookie('csrftoken');
            let response = fetch("/vote", {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    "X-CSRFToken": csrftoken },
            })
        }
        votesCast += 1;
        localStorageData["votesCast"] = votesCast;
        window.localStorage.setItem(urlOfPage, JSON.stringify(localStorageData));

    }

}

function enableButtons() {
    const reviewButtonGood = document.getElementById('reviewButtonGood');
    const reviewButtonOk = document.getElementById('reviewButtonOk');
    const reviewButtonBad = document.getElementById('reviewButtonBad');

    reviewButtonGood.disabled = false;
    reviewButtonOk.disabled = false;
    reviewButtonBad.disabled = false;
}

function disableButtons() {
    const reviewButtonGood = document.getElementById('reviewButtonGood');
    const reviewButtonOk = document.getElementById('reviewButtonOk');
    const reviewButtonBad = document.getElementById('reviewButtonBad');
    
    reviewButtonGood.disabled = true;
    reviewButtonOk.disabled = true;
    reviewButtonBad.disabled = true;
}


// get cookie for fetch
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setInitialNumberStyle() {
    
    let localStorageData = JSON.parse(window.localStorage.getItem(urlOfPage));
    const buttonId = localStorageData["buttonType"];
    if (buttonId) {
        const buttonNumber = document.getElementById(buttonId);
        buttonNumber.classList.add("text-blue-400", "font-bold", "dark:text-yellow-400");
        buttonNumber.dataset.animationState = "3";
        const buttonString = buttonId.split("-");
        const buttonElement = document.getElementById(buttonString[0]);
        buttonElement.classList.remove('hover:scale-125'); 
        buttonElement.classList.remove('transform');
        buttonElement.classList.remove('transition');
        buttonElement.classList.remove('duration-500');
        buttonElement.classList.remove('text-shadow-lg');
        buttonElement.classList.add('animate-spin');
    }
}

// not finalised
function loadListenersForExplanationText() {

    const els = document.getElementsByClassName('js-explanation-word');
    let indexIterator = 1;

    Array.from(els).forEach((el) => {
        //console.log(`${el} is being applied to have this index ${indexIterator}`)
        el.dataset.scrollToTarget = `explanation-${indexIterator}`;
        el.addEventListener('click', () => {
            scrollToTargetAdjusted(el.dataset.scrollToTarget);
        })
        indexIterator += 1;
    });

}

function scrollToTargetAdjusted(elementId){ 
    setTimeout(function() {
        const element = document.getElementById(`${elementId}`);
        const headerOffset = 400;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition - headerOffset;
    
        window.scrollTo({
             top: offsetPosition,
             behavior: "smooth"
        });
    }, 300); 
}