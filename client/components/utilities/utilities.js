'use strict';

var Livewords = Livewords || {};

Livewords.utilities = {

	specialSquares : {},

	letterDist : {
		"A" : [9, 2, 120954, 9, 4, 4, 0],
		"B" : [2, 4, 30124, 2, 1, 1, 0],
		"C" : [2, 2, 64170, 3, 1, 1, 0],
		"D" : [4, 3, 54873, 3, 1, 1, 1],
		"E" : [12, 1, 182743, 13, 6, 5, 0],
		"F" : [2, 4, 20030, 1, 1, 1, 0],
		"G" : [3, 3, 43537, 2, 1, 1, 1],
		"H" : [2, 3, 36764, 2, 1, 1, 0],
		"I" : [9, 1, 140312, 10, 6, 4, 0],
		"J" : [1, 13, 2674, 1, 1, 1, 0],
		"K" : [1, 5, 14451, 1, 1, 1, 0],
		"L" : [4, 2, 84619, 4, 2, 1, 0],
		"M" : [2, 3, 44855, 3, 1, 1, 0],
		"N" : [6, 2, 106772, 5, 2, 2, 0],
		"O" : [8, 2, 103497, 7, 4, 4, 1],
		"P" : [2, 3, 46600, 3, 1, 1, 0],
		"Q" : [1, 13, 2584, 1, 1, 1, 0],
		"R" : [6, 2, 112468, 6, 2, 2, 0],
		"S" : [4, 1, 150216, 7, 3, 2, 0],
		"T" : [6, 2, 104045, 5, 2, 2, 0],
		"U" : [4, 3, 52109, 5, 2, 2, 0],
		"V" : [2, 5, 15429, 1, 1, 1, 0],
		"W" : [2, 6, 12418, 1, 1, 1, 0],
		"X" : [1, 10, 4761, 1, 1, 1, 0],
		"Y" : [2, 4, 25870, 2, 1, 1, 0],
		"Z" : [1, 8, 7601, 1, 1, 1, 0]
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
			var fullBagDist = Math.ceil((this.letterDist[letter][2] / this.numLetters) * 72);
			var halfBagDist = Math.ceil(fullBagDist / 3);
			var thirdBagDist = Math.ceil(fullBagDist / 4);

			if ("AEIOU".indexOf(letter) != -1) {
				fullBagDist = Math.ceil(fullBagDist * 1.35);
				halfBagDist = Math.ceil(halfBagDist * 1.7);
				thirdBagDist = Math.ceil(thirdBagDist * 1.6);
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
	
	componentToHex : function(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	},
	
	rgbToHex : function(r, g, b) {
	    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	},
	
	hexToRgb : function(hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
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

