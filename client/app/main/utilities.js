'use strict';

var Livewords = Livewords || {};

Livewords.utilities = {

	specialSquares : {

		'tw' : [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
		'dw' : [[1, 1], [2, 2], [3, 3], [4, 4], [1, 13], [2, 12], [3, 11], [4, 10], [10, 4], [11, 3], [12, 2], [13, 1], [10, 10], [11, 11], [12, 12], [13, 13], [7, 7]],
		'tl' : [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]],
		'dl' : [[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],[6,2],[6,6],[6,8],[6,12],[7,3],[7,11],[8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],[12,6],[12,8],[14,3],[14,11]]
	},

	letterDist : {
		'A' : [9, 1],
		'B' : [2, 3],
		'C' : [2, 3],
		'D' : [4, 2],
		'E' : [12, 1],
		'F' : [2, 4],
		'G' : [3, 2],
		'H' : [2, 4],
		'I' : [9, 1],
		'J' : [1, 8],
		'K' : [1, 5],
		'L' : [4, 1],
		'M' : [2, 3],
		'N' : [6, 1],
		'O' : [8, 1],
		'P' : [2, 3],
		'Q' : [1, 10],
		'R' : [6, 1],
		'S' : [4, 1],
		'T' : [6, 1],
		'U' : [4, 1],
		'V' : [2, 4],
		'W' : [2, 4],
		'X' : [1, 8],
		'Y' : [2, 4],
		'Z' : [1, 10]
		//' ' : [2, 0]
	},

	initBag : function(bag) {
		var tilescount = 0;
		for (var key in this.letterDist) {
			var numLetters = this.letterDist[key][0];
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
		var index = [Math.floor(Math.random() * bag.length)];
		return bag.splice(index, 1)[0];
	},

	getScore : function(word, placedTiles) {
		var score = 0;
		for (var i = 0; i < word.length; i++) {
			score += this.letterDist[word.charAt(i)][1];
		}
		
		for (var j = 0; j < placedTiles.length; j++) {
			var tile = placedTiles[j];
			var specialSquare = this.getSpecialSquare([tile.row,tile.col]);
			switch (specialSquare) {
			  case "tl":
			    score += (tile.points * 2);
			    break;
			  case "dl":
			    score += tile.points;
			    break;
			}
			
		}
		
		for (var j = 0; j < placedTiles.length; j++) {
			var tile = placedTiles[j];
			var specialSquare = this.getSpecialSquare([tile.row,tile.col]);
			switch (specialSquare) {
			  case "tw":
			    score *= 3;
			    break;
			  case "dw":
			    score *= 2;
			    break;
			}
			
		}

		return score;
	}
};

