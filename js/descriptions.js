//Tweets containing user-written text; the only ones that can be searched
var written_tweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//Filter to just the written tweets
	written_tweets = runkeeper_tweets
		.map(tweet => new Tweet(tweet.text, tweet.created_at))
		.filter(tweet => tweet.written);

	//Show the initial (empty) state, or the results of text typed before the tweets finished loading
	updateSearch(document.getElementById('textFilter').value);
}

//Update the count, search text, and table for the given search string
function updateSearch(searchText) {
	const query = searchText.toLowerCase();
	//An empty search clears the table
	const matches = query === '' ? [] : written_tweets.filter(tweet => tweet.writtenText.toLowerCase().includes(query));

	document.getElementById('searchCount').innerText = matches.length;
	document.getElementById('searchText').innerText = searchText;
	document.getElementById('tweetTable').innerHTML =
		matches.map((tweet, index) => tweet.getHTMLTableRow(index + 1)).join('');
}

function addEventHandlerForSearch() {
	//The input event fires after every character is added or removed
	document.getElementById('textFilter').addEventListener('input', function (event) {
		updateSearch(event.target.value);
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
