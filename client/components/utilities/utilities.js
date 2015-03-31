'use strict';

var Livewords = Livewords || {};

Livewords.utilities = {
	
	specialSquares : {},
	
	letterDist : {
		"A" : [9, 2, 120954, 12, 6, 3],
		"B" : [2, 4, 30124, 2, 1, 1],
		"C" : [2, 2, 64170, 5, 2, 2],
		"D" : [4, 3, 54873, 4, 2, 1],
		"E" : [12, 1, 182743, 17, 8, 5],
		"F" : [2, 4, 20030, 2, 1, 1],
		"G" : [3, 3, 43537, 3, 2, 1],
		"H" : [2, 3, 36764, 3, 2, 1],
		"I" : [9, 1, 140312, 13, 6, 5],
		"J" : [1, 13, 2674, 1, 1, 1],
		"K" : [1, 5, 14451, 1, 1, 1],
		"L" : [4, 2, 84619, 6, 3, 2],
		"M" : [2, 3, 44855, 3, 2, 1],
		"N" : [6, 2, 106772, 7, 3, 2],
		"O" : [8, 2, 103497, 10, 5, 3],
		"P" : [2, 3, 46600, 3, 2, 1],
		"Q" : [1, 13, 2584, 1, 1, 1],
		"R" : [6, 2, 112468, 8, 4, 2],
		"S" : [4, 1, 150216, 10, 4, 3],
		"T" : [6, 2, 104045, 7, 3, 2],
		"U" : [4, 3, 52109, 6, 3, 2],
		"V" : [2, 5, 15429, 1, 1, 1],
		"W" : [2, 6, 12418, 1, 1, 1],
		"X" : [1, 10, 4761, 1, 1, 1],
		"Y" : [2, 4, 25870, 2, 1, 1],
		"Z" : [1, 8, 7601, 1, 1, 1]
	},

	initBag : function(bag, sizeIndex) {
		var tilescount = 0;
		for (var key in this.letterDist) {
			var numLetters = this.letterDist[key][sizeIndex];
			for (var i = 0; i < numLetters; i++) {
				bag[tilescount] = key;
				tilescount++;
			}

		}

	},

	getSpecialSquare : function(square) {

		for (var key in this.specialSquares) {

			var specialSquareArr = this.specialSquares[key];
			for (var i = 0; i < specialSquareArr.length; i++) {
				if (specialSquareArr[i][0] === square[0] && specialSquareArr[i][1] === square[1]) {
					return key;

				}
			}
		}

		return null;

	},

	getLetter : function(bag) {
		if (bag.length > 0) {
			var index = [Math.floor(Math.random() * bag.length)];
			return bag.splice(index, 1)[0];
		} else {
			return null;
		}

	},

	getScore : function(wordTiles, placedTiles) {
		var word = this.getWordFromTiles(wordTiles).toUpperCase();
		var score = 0;
		for (var i = 0; i < word.length; i++) {
			score += this.letterDist[word.charAt(i)][1];
		}

		for (var j = 0; j < placedTiles.length; j++) {
			var tile = placedTiles[j];
			if ($.inArray(tile, wordTiles) != -1) {
				var specialSquare = this.getSpecialSquare([tile.row, tile.col]);
				switch (specialSquare) {
				case "tl":
					score += (tile.points * 2);
					break;
				case "dl":
					score += tile.points;
					break;
				}

			}

		}

		for (var j = 0; j < placedTiles.length; j++) {
			var tile = placedTiles[j];
			if ($.inArray(tile, wordTiles) != -1) {

				var specialSquare = this.getSpecialSquare([tile.row, tile.col]);
				switch (specialSquare) {
				case "tw":
					score *= 3;
					break;
				case "dw":
					score *= 2;
					break;
				}
			}

		}

		return score;
	},

	findLetterDist : function(words) {
		var numLetters = 0;
		for (var i = 0; i < words.length; i++) {
			for (var j = 0; j < words[i].length; j++) {
				numLetters++;
				if (!this.letterDist[words[i].substring(j,j+1).toUpperCase()][2]) {
					this.letterDist[words[i].substring(j,j+1).toUpperCase()][2] = 1;
				} else {
					this.letterDist[words[i].substring(j,j+1).toUpperCase()][2]++;
				}
			}
		}
		this.numLetters = numLetters;

		var numClassic = {
			total : 0,
			vowels : 0
		};
		var numfullBag = {
			total : 0,
			vowels : 0
		};
		var numhalfBag = {
			total : 0,
			vowels : 0
		};
		var numthirdBag = {
			total : 0,
			vowels : 0
		};

		for (var letter in this.letterDist) {
			var fullBagDist = Math.ceil((this.letterDist[letter][2] / this.numLetters) * 50);
			var halfBagDist = Math.ceil(fullBagDist / 2.5);
			var thirdBagDist = Math.ceil(fullBagDist / 4);

			if ("AEIOU".indexOf(letter) != -1) {
				fullBagDist = Math.ceil(fullBagDist * 1.4);
				halfBagDist = Math.ceil(halfBagDist * 1.5);
				thirdBagDist = Math.ceil(thirdBagDist * 1.5);
			}

			var loadedPoints = Math.floor(Math.sqrt(500000 / this.letterDist[letter][2]));
			console.log(letter + ': ' + this.letterDist[letter][1] + ', ' + loadedPoints);
			this.letterDist[letter][1] = loadedPoints;

			numClassic.total += this.letterDist[letter][0];
			numfullBag.total += fullBagDist;
			numhalfBag.total += halfBagDist;
			numthirdBag.total += thirdBagDist;

			if ("AEIOU".indexOf(letter) != -1) {
				numClassic.vowels += this.letterDist[letter][0];
				numfullBag.vowels += fullBagDist;
				numhalfBag.vowels += halfBagDist;
				numthirdBag.vowels += thirdBagDist;
			}
			
			if ("DOG".indexOf(letter) != -1) {
				this.letterDist[letter][6] = 1;
			} else {
				this.letterDist[letter][6] = 0;
			}

			this.letterDist[letter][3] = fullBagDist;
			this.letterDist[letter][4] = halfBagDist;
			this.letterDist[letter][5] = thirdBagDist;
			console.log(this.letterDist[letter]);
		}

		numClassic.percent = numClassic.vowels / numClassic.total;
		numfullBag.percent = numfullBag.vowels / numfullBag.total;
		numhalfBag.percent = numhalfBag.vowels / numhalfBag.total;
		numthirdBag.percent = numthirdBag.vowels / numthirdBag.total;

		console.log("classic bag: " + JSON.stringify(numClassic));
		console.log("full bag: " + JSON.stringify(numfullBag));
		console.log("half bag: " + JSON.stringify(numhalfBag));
		console.log("third bag: " + JSON.stringify(numthirdBag));
	},

	getForegroundColor : function(r, g, b) {

		var color = "white";
		var bright = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		if (bright < .5) {
			color = "black";
		}

		return color;

	},

	getWordFromTiles : function(tiles) {
		var word = '';
		for (var i = 0; i < tiles.length; i++) {
			word += tiles[i].letter.toLowerCase();
		}

		return word;
	},

	imageSearch : null,
	imageSearhCb : null,

	searchComplete : function() {

		// Check that we got results
		if (imageSearch.results && imageSearch.results.length > 0) {

			// Loop through our results, printing them to the page.
			var results = imageSearch.results;

			var result = results[Math.floor(Math.random() * 3)];

			this.imageSearhCb(result.tbUrl);

		}
	},

	getPicture : function(animal, cb) {

		this.imageSearhCb = cb;

		google.load('search', '1');

		imageSearch = new google.search.ImageSearch();

		//imageSearch.setRestriction(google.search.ImageSearch.RESTRICT_IMAGETYPE, google.search.ImageSearch.IMAGETYPE_LINEART);

		// Set searchComplete as the callback function when a search is
		// complete.  The imageSearch object will have results in it.
		imageSearch.setSearchCompleteCallback(this, searchComplete, null);

		imageSearch.execute(animal);
	}
};

