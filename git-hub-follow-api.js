var refreshButton = document.querySelector('.refresh');
var closeButton1 = document.querySelector('.close1');
var closeButton2 = document.querySelector('.close2');
var closeButton3 = document.querySelector('.close3');

// Rx.Observable.forEvent
// Change click event on a element to an observable
//
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');
var close1ClickStream = Rx.Observable.fromEvent(closeButton1, 'click');
var close2ClickStream = Rx.Observable.fromEvent(closeButton2, 'click');
var close3ClickStream = Rx.Observable.fromEvent(closeButton3, 'click');

// Observable startwith
// emits observables click before stream begins, emulates refresh
//
var requestStream = refreshClickStream.startWith('startup click')
    .map(function(){
        var randomOffset = Math.floor(Math.random()*500);
        return 'https://api.github.com/users?since=' + randomOffset;
    });

// Observable flatMap
// Transform emitted observable (metastream - stream of streams) in observables. 
// Then flatten the emited outcome of thos observables into a single observable
//
// Rx.Observable.fromPromise
// turn promise into an observable
var responseStream = requestStream
    .flatMap(function(requestUrl){
        return Rx.Observable.fromPromise($.getJSON(requestUrl));
    });

function createSuggestionStream(closeClickStream){
    // A close stream is combined with a response stream
    // which returns a user. if there is response stream then the combine stream
    // cannot take place. We solve this by populating the refreshClickStream
    //
    return closeClickStream.startWith('startup click')
        .combineLatest(responseStream,
            function(click, listUsers){
                return listUsers[Math.floor(Math.random()*listUsers.length)];
            })
            .merge(
                refreshClickStream.map(function(){
                    return null;
                })
            )
            .startWith(null);
}

var suggestion1Stream = createSuggestionStream(close1ClickStream);
var suggestion2Stream = createSuggestionStream(close2ClickStream);
var suggestion3Stream = createSuggestionStream(close3ClickStream);

// Rendering ---------------------------------------------------
function renderSuggestion(suggestedUser, selector){
    var suggestionElement = document.querySelector(selector);
    if(suggestedUser == null){
        suggestionElement.style.visibility = 'hidden';
    } else {
        suggestionElement.style.visibility = 'visible';
        var usernameElement = suggestionElement.querySelector('.username');
        usernameElement.href = suggestedUser.html_url;
        usernameElement.textContent = suggestedUser.login;
        var imgEl = suggestionElement.querySelector('img');
        imgEl.src = "";
        imgEl.src = suggestedUser.avatar_url;
    }
}

suggestion1Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion1');
});

suggestion2Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion2');
});

suggestion3Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion3');
});

