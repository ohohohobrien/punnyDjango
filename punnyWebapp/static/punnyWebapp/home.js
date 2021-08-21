window.onload = init;

function init() {

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
    
    
    // Get the input field
    const searchField = document.getElementById("searchBar");

    // Allow the input field to be used by pressing enter
    searchField.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (KeyboardEvent.keyCode === 13) {
            event.preventDefault();
            searchButton.click();
        } else if (event.keyCode === 13) {
            // keyCode is deprecated - therefore using both KeyboardEvent and event.keyCode
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            searchButton.click();
        }
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