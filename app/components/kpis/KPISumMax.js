/**
 * @class KPISumMax
 * @memberOf FSCounterAggregatorApp
 * @description Compute the sum or the max depending on the indicator value
 */

var KPISumGeneric = require('./KPISumGeneric');

function KPISumMax($scope, $controller) {

	KPISumGeneric.call(this, $scope, $controller);

	/* this.kpis = {
		"in": $controller("KPISum", { "$scope": $scope }),
		"out": $controller("KPISum", { "$scope": $scope }),
		"count": $controller("KPIMax", { "$scope": $scope }),
		"In": $controller("KPISum", { "$scope": $scope }),
		"Out": $controller("KPISum", { "$scope": $scope }),
		"WaitingTime": $controller("KPIMax", { "$scope": $scope })
	}; */

	/* this.options = {
		indicators: [
			{ id: 'in', name: 'RawIn' },
			{ id: 'out', name: 'RawOut' },
			{ id: 'count', name: 'Max Occupancy' },
			{ id: 'In', name: 'In' },
			{ id: 'Out', name: 'Out' },
			{ id: 'WaitingTime', name: 'WaitingTime' }
		]
	}; */

}

KPISumMax.$inject = ["$scope", "$controller"];

module.exports = KPISumMax;
