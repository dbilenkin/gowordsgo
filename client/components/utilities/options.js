var Livewords = Livewords || {};

Livewords.options = {
	
	boardTypes : {
		
		random : function(chance) {
			
			var specialSquares = {
				'tw' : [],
				'dw' : [],
				'tl' : [],
				'dl' : []
			};
		
			
			for (var row = 0; row < 8; row++) {
				for (var col = 0; col < 8; col++) {
					if (Math.random() > chance) {
						var squareIndex = Math.floor(Math.random() * 100);
						var squareType = '';
						
						if( squareIndex < 40) {
							squareType = 'dl';
						} else if( squareIndex < 70) {
							squareType = 'dw';
						} else if( squareIndex < 90) {
							squareType = 'tl';
						} else {
							squareType = 'tw';
						}
						
						specialSquares[squareType].push([row, col]);
						specialSquares[squareType].push([row, 14-col]);
						specialSquares[squareType].push([14-row, col]);
						specialSquares[squareType].push([14-row, 14-col]);
					}

				}
				
			}
			
			return specialSquares;
		},
		
		classic : {

			'tw' : [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
			'dw' : [[1, 1], [2, 2], [3, 3], [4, 4], [1, 13], [2, 12], [3, 11], [4, 10], [10, 4], [11, 3], [12, 2], [13, 1], [10, 10], [11, 11], [12, 12], [13, 13], [7, 7]],
			'tl' : [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]],
			'dl' : [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]]
		},
		
		randomLots : function() {
			return this.random(.5);
		}, 
		randomMedium : function() {
			return this.random(.8);
		}, 
		randomFew : function() {
			return this.random(.9);
		}, 
		
		none : {
			'tw' : [],
			'dw' : [],
			'tl' : [],
			'dl' : []
		},
		
		
		
	}
	
};
