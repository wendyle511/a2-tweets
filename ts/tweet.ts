class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//Matches the start of every completed-event tweet, e.g. "Just completed a ", "Just posted a ", "Completed a "
	private static readonly COMPLETED_PREFIX = /^(?:Just (?:completed|posted)|Completed) an? /;

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        // Completed events: "Just completed a 5 km run ...", "Just posted a 3 mi walk ...", "Completed a 7 km walk ..."
        if (Tweet.COMPLETED_PREFIX.test(this.text)) {
            return "completed_event";
        }
        // Live events: "Watch my run right now with @Runkeeper Live ... #RKLive"
        if (this.text.startsWith("Watch my ") && this.text.includes("Live")) {
            return "live_event";
        }
        // Achievements: personal records and newly set goals
        if (this.text.startsWith("Achieved a new personal record") || this.text.includes("I just set a goal")) {
            return "achievement";
        }
        return "miscellaneous";
    }

    //The tweet text with the t.co link(s) and the #Runkeeper hashtag removed
    private get textWithoutBoilerplate():string {
        return this.text
            .replace(/https?:\/\/\S+/g, "")
            .replace(/#runkeeper/gi, "")
            .trim();
    }

    //The text the user typed, or "" if the tweet only contains RunKeeper's default phrases.
    //Default formats: "... with @Runkeeper. Check it out!" and "... - TomTom MySports Watch".
    //Custom text, when present, follows the first " - " of the tweet: "Just posted a 5 km run - Nice and easy!"
    private get userText():string {
        if (this.source != "completed_event") {
            return "";
        }
        const match = this.textWithoutBoilerplate.match(/^.*? - ([\s\S]*)$/);
        if (match === null) {
            return "";
        }
        const custom = match[1].trim();
        if (custom === "" || custom === "TomTom MySports Watch") {
            return "";
        }
        return custom;
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        return this.userText.length > 0;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        return this.userText;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        // Distance-based: "Just completed a 4.87 km run with ...", "... a 3 mi mtn bike - ...", "Completed a 7 km walk @ 4 km/h ..."
        const distanceMatch = this.text.match(/^(?:Just (?:completed|posted)|Completed) an? [\d.,]+ ?(?:km|mi) (.*?)(?: with | - |  | @ | https?:|$)/);
        if (distanceMatch !== null) {
            return distanceMatch[1].trim();
        }
        // Duration-based: "Just posted a strength workout in 1:00:00  with ..."
        const durationMatch = this.text.match(/^(?:Just (?:completed|posted)|Completed) an? (.*?) in \d+:\d+/);
        if (durationMatch !== null) {
            return durationMatch[1].trim();
        }
        return "unknown";
    }

    //distance in miles (0 for completed events with no distance, e.g. time-based workouts)
    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const match = this.text.match(/^(?:Just (?:completed|posted)|Completed) an? ([\d.,]+) ?(km|mi) /);
        if (match === null) {
            return 0;
        }
        const value = parseFloat(match[1].replace(",", "."));
        return match[2] === "km" ? value / 1.609 : value;
    }

    getHTMLTableRow(rowNumber:number):string {
        // Turn every link in the tweet into a clickable anchor
        const linkedText = this.text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>');
        return "<tr><td>" + rowNumber + "</td><td>" + this.activityType + "</td><td>" + linkedText + "</td></tr>";
    }
}
