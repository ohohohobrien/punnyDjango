window.onload = init;

let pun = {
    "content": "",
    "styledContent": "",
    "explanation": {},
    "currentSelectedText": "",
    "startingRange": "",
    "endingRange": "",
};

let nextPageButtonEnabled = false;
let nextPageButton2Enabled = false;
let explanationIncrementer = 0;

const mobileDeviceDetected = isMobile();

function init() {

    // confetti
    var confettiElement = document.getElementById('my-canvas');
    var confettiSettings = {"target":confettiElement,"max":"200","size":"1","animate":true,"props":["circle","square","triangle","line"],"colors":[[165,104,246],[230,61,135],[0,199,228],[253,214,126]],"clock":"25","rotate":true,"respawn":true};
    var confetti = new ConfettiGenerator(confettiSettings);
    
    const punTextarea = document.getElementById('punContent');
    const punContentDiv = document.getElementById('punContentDiv');
    const punTextareaDisplay = document.getElementById('punContentDisplay');
    const explanationInsertContainer = document.getElementById("punExplanationInsertContainer");
    const punTextareaSpecialCharacterError = document.getElementById("punContentHelperSpecialCharacter");

    punTextarea.addEventListener('input', () => {

        pun.content = punTextarea.value;
        pun.styledContent = pun.content;
        punTextareaDisplay.innerHTML = pun.content;

        const regex = new RegExp(/<|>/gm);

        if (regex.test(pun.content)) {
            punTextareaSpecialCharacterError.style.display = "block";
            punContentDiv.classList.add('border-red-700');
            punContentDiv.classList.add('border-2');
            nextPageButtonEnabled = false;
        } else {
            if (punTextareaSpecialCharacterError.style.display === "block") {
                punTextareaSpecialCharacterError.style.display = "none";
                punContentDiv.classList.remove('border-red-700');
                punContentDiv.classList.remove('border-2');
            }
            if (pun.content.length > 3) {
                enableNextButton();
                removeHelperForPun();
            } else {
                disableNextButton();
            }
        }

    })

    document.addEventListener('selectionchange', selectableTextAreaMouseUp);
    punTextareaDisplay.addEventListener('mouseup', moveQuoteButton);

    const nextButton = document.getElementById('nextButton');

    const section1 = document.getElementById("section1");
    const section2 = document.getElementById("section2");
    const previewPun = document.getElementById('previewContentDisplay');

    nextButton.addEventListener('click', () => {
        if (nextPageButtonEnabled) {
            explanationIncrementer = 0;
            pun.explanation = {};
            previewPun.innerHTML = pun.content;

            // add pretty animations at some point zzz
            
            // hide current page
            section1.classList.remove("fadeIn");
            section1.classList.add("fadeOut");
            section1.addEventListener("animationend", pageGoForwardAnimation);

        } else {
            addHelperForPun();
        }
    });

    const backButton = document.getElementById('backButton');

    backButton.addEventListener('click', () => {

        // add pretty animations at some point zzz
        section2.classList.remove("fadeIn");
        section2.classList.add("fadeOut");
        section2.addEventListener("animationend", pageGoBackAnimation);

        // delete the elements and remove JSON contents
        pun.explanation = {};

        while(explanationInsertContainer.children.length > 0) {
            explanationInsertContainer.children[0].remove();
        }

    });

    const nextButton2 = document.getElementById('nextButton2');
    const quoteButton = document.getElementById('quoteButton');
    const addExplanationButton = document.getElementById("addExplanationButton");

    quoteButton.addEventListener('click', () => {

        let notQuotedPreviously = true;
        notQuotedPreviously = checkIfQuotedBefore();

        if (notQuotedPreviously === true) {
            if (pun.currentSelectedText.length > 0) {
                explanationIncrementer += 1;
                explanationInsertContainer.append(createExplanationContainer(pun.currentSelectedText)); // send selected text as string
                nextButton2.classList.add("opacity-40");
                updateThePunTextForQuote();
            }
    
            removeErrorDisplayForZeroExplainers();
            updateExplanationContainerNumbers();
        } else {
            addHelperForQuote();
        }

        quoteButton.style.display = "none";
        addExplanationButton.style.display = "block";
    });

    document.addEventListener("mousedown", documentMouseDown);

    addExplanationButton.addEventListener('click', () => {
        explanationIncrementer += 1;
        explanationInsertContainer.append(createExplanationContainer("")); // send a blank "" string
        removeErrorDisplayForZeroExplainers();
        nextButton2.classList.add("opacity-40");
        updateExplanationContainerNumbers();
    });
    
    nextButton2.addEventListener('click', () => {
        checkExplanationsCompleted();
        if (nextPageButton2Enabled === true) {

            // style the button to be loading
            nextButton2.innerHTML = `<i class="fa fa-circle-o-notch fa-spin"></i> &nbsp Loading`

            // send fetch request

            // control the fetch request
            const data = JSON.stringify({
                punJSON: pun,
            })
            
            let csrftoken = getCookie('csrftoken');
            let response = fetch("/upload", {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-CSRFToken": csrftoken },
            })
            /*
            .then(response => {
                console.log(response.json());                
            })
            */
            .then(function(data) {
                data.text().then( text => {
                    //console.log(text);
                    confetti.render();
                    section2.classList.remove("fadeIn");
                    section2.classList.add("fadeOut");
                    section2.addEventListener("animationend", pageFinishAnimation);
                    document.getElementById('newPunPage').href = text;
                    document.getElementById('shareButtons').dataset.metaLink = text;
                    updateShareButtonLinks(text);
                });
            })
            .then(result => {
                console.log('Success:', result);
            })
            .catch(error => {
                console.error('Error:', error);
                console.log("something went wrong with uploading the pun")
            });
                
        }
    })

    enableDarkMode();
}

function updateShareButtonLinks(newPunID) {
    const shareButtons = document.getElementById('shareButtons').getElementsByTagName('a');

    Array.prototype.forEach.call(shareButtons, function(element) {
        element.href = element.href.replace('create', newPunID.toString());
    });
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

function pageGoBackAnimation() {

    const section1 = document.getElementById("section1");
    const section2 = document.getElementById("section2");

    section2.style.display = "none";
    section2.classList.remove("fadeOut");
    section1.classList.add("fadeIn");
    section1.style.display = "block";
    scrollToTargetAdjusted('section1');
    section2.removeEventListener("animationend", pageGoBackAnimation);
}

function pageGoForwardAnimation() {

    const section1 = document.getElementById("section1");
    const section2 = document.getElementById("section2");

    section1.style.display = "none";
    section1.classList.remove("fadeOut");
    section2.classList.add("fadeIn");
    section2.style.display = "block";
    scrollToTargetAdjusted('section2');
    section1.removeEventListener("animationend", pageGoForwardAnimation);
}

function pageFinishAnimation() {

    const section2 = document.getElementById("section2");
    const section3 = document.getElementById("section3");

    section2.style.display = "none";
    section2.classList.remove("fadeOut");
    section3.classList.add("fadeIn");
    section3.style.display = "block";
    scrollToTargetAdjusted('section3');
    section2.removeEventListener("animationend", pageGoForwardAnimation);
}

function documentMouseDown(event) {
    const quoteButton = document.getElementById('quoteButton');
    if (getComputedStyle(quoteButton).display === "block" && event.target.id !== "quoteButton") {
        setTimeout(() => {
            quoteButton.style.display = "none";
            addExplanationButton.style.display = "block";
        }, 300);
        window.getSelection().empty();
    }
    removeHelperForQuote();
}

function moveQuoteButton(event) {
    const quoteButton = document.getElementById('quoteButton');

    if (!mobileDeviceDetected) {
        setTimeout(() => {
            if (pun.currentSelectedText.length > 0) {
                //console.log("PC highlighting detected");
                quoteButton.style.display = "block";
                quoteButton.style.position = "absolute";
                const x = event.pageX;
                const y = event.pageY;
                const quoteButtonWidth = Number(getComputedStyle(quoteButton).width.slice(0, -2)); //"40px" - slice off px
                const quoteButtonHeight = Number(getComputedStyle(quoteButton).height.slice(0, -2)); //convert to number to use in calculation
                quoteButton.style.left = `${x - quoteButtonWidth*0.5}px`;
                quoteButton.style.top = `${y - quoteButtonHeight*1.5}px`;
            }
        }, 0);
    }
}

function selectableTextAreaMouseUp(event) {

    const getSelection = window.getSelection();

    let detectedNodeID = null;

    try {
        detectedNodeID = getSelection.anchorNode.parentNode.id;
    } catch {
        detectedNodeID = null;
    }

    if (detectedNodeID === "punContentDisplay") {
        //const quoteButton = document.getElementById('quoteButton');
        //console.log(getSelection);
        const selectedText = getSelection.toString().trim();
        pun.currentSelectedText = selectedText;
        pun.startingRange = getSelection.anchorOffset;
        pun.endingRange = getSelection.focusOffset;

        //console.log(`Selected text of ${selectedText} at range ${pun.startingRange} to ${pun.endingRange}.`);

        if (mobileDeviceDetected) {
            setTimeout(() => {
                if (selectedText.length > 0) {
                    //console.log("touchscreen highlighting detected");
                    addExplanationButton.style.display = "none";
                    quoteButton.style.display = "block";
                    quoteButton.style.position = "static";
                }
            }, 0);
        }
    }
}

function enableNextButton() {
    const nextButton = document.getElementById('nextButton');
    nextButton.classList.remove('opacity-40');
    nextPageButtonEnabled = true;
}

function disableNextButton() {
    const nextButton = document.getElementById('nextButton');
    nextButton.classList.add('opacity-40');
    nextPageButtonEnabled = false;
}

function addHelperForPun() {
    const punContentDiv = document.getElementById('punContentDiv');
    punContentDiv.classList.add('border-red-700');
    punContentDiv.classList.add('border-2');

    const punContentHelper = document.getElementById('punContentHelper');
    punContentHelper.style.display = "block";
}

function removeHelperForPun() {
    const punContentDiv = document.getElementById('punContentDiv');
    punContentDiv.classList.remove('border-red-700');
    punContentDiv.classList.remove('border-2');

    const punContentHelper = document.getElementById('punContentHelper');
    punContentHelper.style.display = "none";
}

function addHelperForQuote() {
    const punContentDiv = document.getElementById('punContentDisplayDiv');
    punContentDiv.classList.add('border-red-700');
    punContentDiv.classList.add('border-2');

    const punContentHelper = document.getElementById('explanationContentHelperQuoteError');
    punContentHelper.style.display = "block";
}

function removeHelperForQuote() {
    const punContentDiv = document.getElementById('punContentDisplayDiv');
    punContentDiv.classList.remove('border-red-700');
    punContentDiv.classList.remove('border-2');

    const punContentHelper = document.getElementById('explanationContentHelperQuoteError');
    punContentHelper.style.display = "none";
}

function enableDarkMode() {
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
}

// HTML Element Creation for explanation container
function createExplanationContainer(explanationString) {

    pun.explanation[`${explanationIncrementer}`] = {};

    const punExplanationDiv = document.createElement('div');
    punExplanationDiv.classList.add("px-2", "py-2", "mt-5", "md:px-10", "lg:px-20");
    punExplanationDiv.id = `punExplanationDiv-${explanationIncrementer}`;
    punExplanationDiv.dataset.idNumber = `${explanationIncrementer}`;

    // text container
    const punDivInner = document.createElement('div');
    punDivInner.classList.add("bg-yellow-300", "dark:bg-gray-800", "px-5", "py-10", "rounded-sm", "rounded-br-none", "shadow-2xl");
    punDivInner.id = `punDivInner-${explanationIncrementer}`;
    punExplanationDiv.append(punDivInner);

    const punDivInnerHeader = document.createElement('h3');
    punDivInnerHeader.classList.add("text-2xl", "text-shadow-md", "mb-4", "dark:text-yellow-400");
    if (explanationString.length > 0) punDivInnerHeader.innerHTML = `explanation ${explanationIncrementer} - ${explanationString}`
    else punDivInnerHeader.innerHTML = `explanation ${explanationIncrementer}`;
    // js accessor class list
    punDivInnerHeader.classList.add("js-stringReplace");
    punDivInner.append(punDivInnerHeader);

    const punTextArea = document.createElement('textarea');
    punTextArea.classList.add("text-2xl", "text-shadow-md", "w-full", "min-h-0", "p-5", "resize-y", "rounded-sm", "bg-yellow-100", "dark:bg-gray-600", "dark:text-yellow-300", "focus:bg-yellow-200", "dark:hover:border-yellow-400", "dark:focus:bg-black-700", "transform", "ease-in-out", "duration-500");
    punTextArea.name = "punExplanation";
    punTextArea.cols = "3";
    punTextArea.rows = "3";
    punTextArea.placeholder = "write your explanation here!";
    // set values required for the JSON
    if (explanationString.length > 0) {
        punTextArea.value = `${explanationString} - `;
        pun.explanation[`${explanationIncrementer}`].explanationContent = `${explanationString} - `;
        // set details for linking
        pun.explanation[`${explanationIncrementer}`].link = true;
        pun.explanation[`${explanationIncrementer}`].stringStartPosition = pun.startingRange;
        pun.explanation[`${explanationIncrementer}`].stringEndPosition = pun.endingRange;
    } else {
        punTextArea.value = explanationString;
        pun.explanation[`${explanationIncrementer}`].explanationContent = "";
        // set details to false for linking
        pun.explanation[`${explanationIncrementer}`].link = false;
        pun.explanation[`${explanationIncrementer}`].stringStartPosition = false;
        pun.explanation[`${explanationIncrementer}`].stringEndPosition = false;
    }
    pun.explanation[`${explanationIncrementer}`].id = `${explanationIncrementer}`;
    
    punTextArea.id = `punExplanationTextarea-${explanationIncrementer}`;
    punDivInner.append(punTextArea);
    
    // error text
    const explanationHelperText = document.createElement('span');
    explanationHelperText.classList.add("text-xs", "font-bold", "text-red-700")
    explanationHelperText.style.display = "none";
    explanationHelperText.id = `punExplanationHelper-${explanationIncrementer}`;
    explanationHelperText.innerHTML = "please enter an explanation with more than 10 characters.";
    punDivInner.append(explanationHelperText);

    // error text special character
    const explanationHelperSpecialCharacterError = document.createElement('span');
    explanationHelperSpecialCharacterError.classList.add("text-xs", "font-bold", "text-red-700")
    explanationHelperSpecialCharacterError.style.display = "none";
    explanationHelperSpecialCharacterError.id = `punExplanationHelperSpecialCharacterError-${explanationIncrementer}`;
    explanationHelperSpecialCharacterError.innerHTML = `please don't use the characters "<" or ">" in your explanation.`;
    punDivInner.append(explanationHelperSpecialCharacterError);

    // attach listener to text area
    punTextArea.addEventListener("input", () => {
        pun.explanation[`${punExplanationDiv.dataset.idNumber}`].explanationContent = punTextArea.value;
        enableNextButton2();

        if (punTextArea.value.length > 10) {
            explanationHelperText.style.display = "none";
            punDivInner.classList.remove('border-red-700');
            punDivInner.classList.remove('border-2');
        }

        const regex = new RegExp(/<|>/gm);

        if (regex.test(punTextArea.value)) {
            //console.log("should show error now")
            explanationHelperSpecialCharacterError.style.display = "block";
            punDivInner.classList.add('border-red-700');
            punDivInner.classList.add('border-2');
        } else {
            if (explanationHelperSpecialCharacterError.style.display === "block") {
                explanationHelperSpecialCharacterError.style.display = "none";
                punDivInner.classList.remove('border-red-700');
                punDivInner.classList.remove('border-2');
            }
        }
        
    });

    // button container
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add("flex", "justify-end");
    punExplanationDiv.append(buttonContainer);

    const buttonClose = document.createElement('button');
    buttonClose.style.zIndex = "10";
    buttonClose.classList.add("bg-yellow-300", "hover:bg-yellow-400", "dark:bg-gray-800", "dark:text-yellow-400", "dark:hover:bg-gray-900", "rounded-sm", "rounded-t-none", "shadow-2xl", "h-8", "w-12", "md:h-14", "md:w-24", "lg:h-16", "lg:w-32", "transform", "ease-in-out", "duration-500");
    buttonClose.ariaLabel = "remove explanation";
    buttonClose.id = `punExplanationButtonClose-${explanationIncrementer}`;
    buttonContainer.append(buttonClose);

    const buttonSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    buttonSVG.classList.add("w-6", "h-6", "mx-auto");
    buttonSVG.setAttribute("fill", "none");
    buttonSVG.setAttribute("stroke", "currentColor");
    buttonSVG.setAttribute("viewBox", "0 0 24 24");
    buttonSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    buttonClose.append(buttonSVG);

    const buttonSVGPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    buttonSVGPath.setAttribute("stroke-linecap", "round");
    buttonSVGPath.setAttribute("stroke-linejoin", "round");
    buttonSVGPath.setAttribute("stroke-width", "2");
    buttonSVGPath.setAttribute("d", "M6 18L18 6M6 6l12 12");
    buttonSVG.append(buttonSVGPath);

    buttonClose.addEventListener('click', () => {
        
        // delete object data
        //console.log("Delete the following object:");
        //console.log(pun.explanation[`${punExplanationDiv.dataset.idNumber}`]);
        delete pun.explanation[`${punExplanationDiv.dataset.idNumber}`];
        //console.log("Should be deleted now - is it still here?");
        //console.log(pun.explanation[`${punExplanationDiv.dataset.idNumber}`]);

        //modify next page button to disabled if all explanation containers removed
        if (Object.keys(pun.explanation).length === 0) {
            document.getElementById('nextButton2').classList.add('opacity-40');
        }

        punExplanationDiv.remove();

        updateExplanationContainerNumbers();
        updateThePunTextForQuote();
    });

    scrollToTargetAdjusted(punExplanationDiv.id);
    setTimeout(function() {
        punTextArea.focus();
    }, 500);
    
    return punExplanationDiv;

}

function enableNextButton2() {

    const nextButton = document.getElementById('nextButton2');
    let nextButton2Enabled = true;
    const regex = new RegExp(/<|>/gm);

    for (const object in pun.explanation) {
        if (pun.explanation[object].explanationContent.length < 10) {
            nextButton2Enabled = false;
        }
        if (regex.test(pun.explanation[object].explanationContent)) {
            nextButton2Enabled = false;
            nextPageButton2Enabled = false;
        }
    } 

    nextPageButton2Enabled = nextButton2Enabled; // set global to local value

    if (nextPageButton2Enabled) {
        nextButton.classList.remove('opacity-40');
    } else {
        nextButton.classList.add('opacity-40');
    }
    
}

function checkExplanationsCompleted() {

    const nextButton = document.getElementById('nextButton2');
    let nextButton2Enabled = true;
    let scrollToIndex = false;
    let explanationContainersMoreThanZero = true;
    const regex = new RegExp(/<|>/gm);

    if (Object.keys(pun.explanation).length < 1) {
        nextButton2Enabled = false;
        explanationContainersMoreThanZero = false;
    }

    for (const object in pun.explanation) {
        if (pun.explanation[object].explanationContent.length < 10) {
            nextButton2Enabled = false;
            if (scrollToIndex === false) scrollToIndex = pun.explanation[object].id;

            // add the styling for error
            const errorDiv = document.getElementById(`punDivInner-${pun.explanation[object].id}`);
            errorDiv.classList.add('border-red-700');
            errorDiv.classList.add('border-2');

            const punContentHelper = document.getElementById(`punExplanationHelper-${pun.explanation[object].id}`);
            punContentHelper.style.display = "block";
        } 
        if (regex.test(pun.explanation[object].explanationContent)) {
            nextButton2Enabled = false;
            if (scrollToIndex === false) scrollToIndex = pun.explanation[object].id;

            // add the styling for error
            const errorDiv = document.getElementById(`punDivInner-${pun.explanation[object].id}`);
            errorDiv.classList.add('border-red-700');
            errorDiv.classList.add('border-2');

            const punContentHelper = document.getElementById(`punExplanationHelperSpecialCharacterError-${pun.explanation[object].id}`);
            punContentHelper.style.display = "block";
        } 

    }

    if (nextButton2Enabled === false) {

        if (explanationContainersMoreThanZero) {
            // scroll to top most error
            //console.log(`scrollToIndex is ${scrollToIndex}`);
            scrollToTargetAdjusted(`punExplanationTextarea-${scrollToIndex}`);
        } else {
            // enable the error for no explanations
            const punContentDisplayDiv = document.getElementById('punContentDisplayDiv');
            const explanationContentHelper = document.getElementById('explanationContentHelper');

            punContentDisplayDiv.classList.add('border-red-700');
            punContentDisplayDiv.classList.add('border-2');

            explanationContentHelper.style.display = "block";

            scrollToTargetAdjusted('punContentDisplayDiv');
        }
    }
    
    nextPageButton2Enabled = nextButton2Enabled; // set global to local value

    if (nextPageButton2Enabled) {
        nextButton.classList.remove('opacity-40');
    } else {
        nextButton.classList.add('opacity-40');
    }
}

function scrollToTargetAdjusted(elementId){ 
    setTimeout(function() {
        const element = document.getElementById(`${elementId}`);
        const offset = 200;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
    
        window.scrollTo({
             top: offsetPosition,
             behavior: "smooth"
        });
    }, 0); 
}

function removeErrorDisplayForZeroExplainers() {
    const punContentDisplayDiv = document.getElementById('punContentDisplayDiv');
    const explanationContentHelper = document.getElementById('explanationContentHelper');

    punContentDisplayDiv.classList.remove('border-red-700');
    punContentDisplayDiv.classList.remove('border-2');

    explanationContentHelper.style.display = "none";
}

function isMobile() { return ('ontouchstart' in document.documentElement); }

function updateExplanationContainerNumbers() {

    if (Object.keys(pun.explanation).length !== 0) {

        const regex = new RegExp(/\d+/gm);
        let increment = 1;
        
        const arrayOfElements = document.getElementsByClassName('js-stringReplace');
        
        Array.prototype.forEach.call(arrayOfElements, function(element) {
            element.innerHTML = element.innerHTML.toString().replace(regex, increment);
            increment += 1;
        });
    
    }

}

function updateThePunTextForQuote() {
    
    const initialString = pun.content;
    const spanFirstPart = `<span class="text-white dark:text-yellow-400 font-bold">`;
    const spanSecondPart = `</span>`;
    const spanFirstLength = spanFirstPart.length;
    const spanBothLength = spanFirstPart.length + spanSecondPart.length;

    // create an array of 2d arrays representing the values that should be changed

    let array = [];

    for (const object in pun.explanation) {
        if (pun.explanation[object].link === true) {
            const arrayToAdd = [pun.explanation[object].stringStartPosition, pun.explanation[object].stringEndPosition];
            array.push(arrayToAdd);
        } 
    }

    console.log("Array of the following coordinates generated.");
    console.log(array);

    // sort these by smallest range first

    array.sort(function(a, b) {
        return a[0] - b[0];
    });

    console.log("Sorted array into the following.");
    console.log(array);

    // add the styling in a for loop and + onto the values in the array for each iteration

    pun.styledContent = initialString;
    for (let i = 0; i < array.length; i++) {

        
        console.log(`Iteration ${i}`);
        console.log(pun.styledContent.slice(0, (array[i][0] + (spanBothLength * i))));
        console.log(0, (array[i][0] + (spanBothLength * i)));
        console.log(spanFirstPart);
        console.log(pun.styledContent.slice((array[i][0] + (spanBothLength * i)), (array[i][1] + (spanBothLength * i))));
        console.log((array[i][0] + (spanBothLength * i) + spanFirstLength));
        console.log(spanSecondPart);
        console.log(pun.styledContent.slice((array[i][1] + (spanBothLength * i))));
        
        pun.styledContent = [pun.styledContent.slice(0, (array[i][0] + (spanBothLength * i))), spanFirstPart, pun.styledContent.slice((array[i][0] + (spanBothLength * i)), (array[i][1] + (spanBothLength * i))), spanSecondPart, pun.styledContent.slice((array[i][1] + (spanBothLength * i)))].join('').toString();
    }

    console.log("Generated the following formatted styled content.");
    console.log(pun.styledContent);

    // set the preview element to the styled HTML
    document.getElementById('previewContentDisplay').innerHTML = pun.styledContent;
}

function checkIfQuotedBefore() {
    let notQuotedBefore = true;

    // if nothing has been quoted - then allow text to be quoted
    if (Object.keys(pun.explanation).length === 0) return notQuotedBefore;

    // if explanations exist, check if they are links and check the ranges
    const highlightStart = pun.startingRange;
    const highlightFinish = pun.endingRange;

    for (const object in pun.explanation) {
        if (pun.explanation[object].link === true) {
            // start is within quoted text
            if (highlightStart >= pun.explanation[object].stringStartPosition && highlightStart <= pun.explanation[object].stringEndPosition) notQuotedBefore = false;
            // end is within the quoted text
            if (highlightFinish >= pun.explanation[object].stringStartPosition && highlightFinish <= pun.explanation[object].stringEndPosition) notQuotedBefore = false;
            // quote text is within the highlight
            if (pun.explanation[object].stringStartPosition >= highlightStart && pun.explanation[object].stringStartPosition <= highlightFinish) notQuotedBefore = false;
            if (pun.explanation[object].stringEndPosition >= highlightStart && pun.explanation[object].stringEndPosition <= highlightFinish) notQuotedBefore = false;
        } 
    }

    return notQuotedBefore;
}