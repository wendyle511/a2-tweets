//Format a number as a percentage string with exactly two decimal places
function formatPct(count, total) {
	const pct = total === 0 ? 0 : (count / total) * 100;
	return math.format(pct, {notation: 'fixed', precision: 2}) + '%';
}

//Set the text of every element with the given class
function setClassText(className, value) {
	for (const el of document.getElementsByClassName(className)) {
		el.innerText = value;
	}
}

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	document.getElementById('numberTweets').innerText = tweet_array.length;

	//Earliest and latest tweet dates
	const times = tweet_array.map(tweet => tweet.time.getTime());
	const dateFormat = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
	document.getElementById('firstDate').innerText = new Date(Math.min(...times)).toLocaleDateString('en-US', dateFormat);
	document.getElementById('lastDate').innerText = new Date(Math.max(...times)).toLocaleDateString('en-US', dateFormat);

	//Tweet categories
	const total = tweet_array.length;
	const completed = tweet_array.filter(tweet => tweet.source == 'completed_event');
	const categories = {
		completedEvents: completed.length,
		liveEvents: tweet_array.filter(tweet => tweet.source == 'live_event').length,
		achievements: tweet_array.filter(tweet => tweet.source == 'achievement').length,
		miscellaneous: tweet_array.filter(tweet => tweet.source == 'miscellaneous').length
	};
	for (const [name, count] of Object.entries(categories)) {
		setClassText(name, count);
		setClassText(name + 'Pct', formatPct(count, total));
	}

	//User-written text among completed events
	const writtenCount = completed.filter(tweet => tweet.written).length;
	setClassText('written', writtenCount);
	setClassText('writtenPct', formatPct(writtenCount, completed.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
