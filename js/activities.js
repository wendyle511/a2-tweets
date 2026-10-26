const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//Mean of an array of numbers (0 if empty)
function mean(values) {
	return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

//Build a Vega-Lite spec plotting distance by day of week for the given data, colored by activity type
function distanceSpec(values, aggregated) {
	return {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": aggregated ? "Mean distance by day of the week for the three most common activities."
			: "Distance by day of the week for the three most common activities.",
		"width": 500,
		"data": {"values": values},
		"mark": aggregated ? {"type": "point", "filled": true, "size": 90} : {"type": "point"},
		"encoding": {
			"x": {"field": "day", "type": "ordinal", "sort": DAY_NAMES, "title": "Day of the week"},
			"y": aggregated
				? {"field": "distance", "aggregate": "mean", "type": "quantitative", "title": "Mean distance (mi)"}
				: {"field": "distance", "type": "quantitative", "title": "Distance (mi)"},
			"color": {"field": "activityType", "type": "nominal", "title": "Activity type"}
		}
	};
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

	//Count the tweets of each activity type (completed events only)
	const completed = tweet_array.filter(tweet => tweet.source == 'completed_event' && tweet.activityType != 'unknown');
	const counts = {};
	for (const tweet of completed) {
		counts[tweet.activityType] = (counts[tweet.activityType] || 0) + 1;
	}
	const countData = Object.entries(counts).map(([activityType, count]) => ({activityType, count}));
	const ranked = countData.slice().sort((a, b) => b.count - a.count).map(d => d.activityType);
	const top3 = ranked.slice(0, 3);

	document.getElementById('numberActivities').innerText = ranked.length;
	document.getElementById('firstMost').innerText = top3[0];
	document.getElementById('secondMost').innerText = top3[1];
	document.getElementById('thirdMost').innerText = top3[2];

	//Graph 1: number of tweets per activity type
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": countData
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {"field": "activityType", "type": "nominal", "sort": "-y", "title": "Activity type"},
	    "y": {"field": "count", "type": "quantitative", "title": "Number of Tweets"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//Data for the top three activities: distance (miles) and day of the week
	const distanceData = completed
		.filter(tweet => top3.includes(tweet.activityType))
		.map(tweet => ({activityType: tweet.activityType, distance: tweet.distance, day: DAY_NAMES[tweet.time.getDay()]}));

	//Graphs 2 and 3: all points, and means
	vegaEmbed('#distanceVis', distanceSpec(distanceData, false), {actions:false});
	vegaEmbed('#distanceVisAggregated', distanceSpec(distanceData, true), {actions:false});

	//Longest and shortest activity types (by mean distance among the top three)
	const meanByType = top3.map(type => ({type, mean: mean(distanceData.filter(d => d.activityType == type).map(d => d.distance))}));
	meanByType.sort((a, b) => b.mean - a.mean);
	document.getElementById('longestActivityType').innerText = meanByType[0].type;
	document.getElementById('shortestActivityType').innerText = meanByType[meanByType.length - 1].type;

	//Weekdays vs weekends: compare mean distance
	const isWeekend = d => d.day == 'Sat' || d.day == 'Sun';
	const weekendMean = mean(distanceData.filter(isWeekend).map(d => d.distance));
	const weekdayMean = mean(distanceData.filter(d => !isWeekend(d)).map(d => d.distance));
	document.getElementById('weekdayOrWeekendLonger').innerText = weekendMean > weekdayMean ? 'weekends' : 'weekdays';

	//Toggle between the raw and aggregated plots
	const rawDiv = document.getElementById('distanceVis');
	const aggDiv = document.getElementById('distanceVisAggregated');
	const button = document.getElementById('aggregate');
	aggDiv.style.display = 'none';
	button.addEventListener('click', function () {
		const showingRaw = rawDiv.style.display !== 'none';
		rawDiv.style.display = showingRaw ? 'none' : '';
		aggDiv.style.display = showingRaw ? '' : 'none';
		button.innerText = showingRaw ? 'Show all activities' : 'Show means';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
