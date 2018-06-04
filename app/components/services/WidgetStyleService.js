/**
 * @class WidgetStyleService
 * @memberOf FSCounterAggregatorApp
 * @description Retrieve rendering style information for widgets
 */
(function () {

	angular.module('FSCounterAggregatorApp').
		service('WidgetStyleService', [
			"$http", "$q",
			function (
				$http, $q) {

				this.widgetStyles = {
					"GraphKPIWidget": {
						"json": "assets/graphsite.json",
						"css": undefined,
						"cached": undefined
					},
					"StatBoxWidget": {
						"json": "assets/statbox.json",
						"css": undefined,
						"cached": undefined
					},
					"TotalInWidget": {
						"json": "assets/statbox.json",
						"css": undefined,
						"cached": undefined
					},
					"TableKPIWidget": {
						"json": "assets/table.json",
						"css": undefined,
						"cached": undefined
					}
				};

				/**
				 * @function getStyle
				 * @memberOf FSCounterAggregator.WidgetStyleService
				 * @description retrieve style information for a particular widget
				 */
				this.getStyle = function (widgetId) {
					if (this.widgetStyles[widgetId] === undefined) {
						return $q.when({});
					} else if (this.widgetStyles[widgetId].json_cached !== undefined) {
						return $q.when(this.widgetStyles[widgetId].cached);
					} else {
						var that = this;
						return $http.get(this.widgetStyles[widgetId].json).
							then(function (ret) {
								that.widgetStyles[widgetId].cached = { "json": ret.data };
								return that.widgetStyles[widgetId].cached;
							});
					}
				};

				/**
				 * @function buildItemsList
				 * @memberOf FSCounterAggregator.WidgetStyleService
				 * @description Returns ids/labels pairs for a set of sites
				 * including items is specified. Mainly used for selection widget				 
				 */
				this.buildItemsList = function (sites, showItems) {
					if (showItems) {
						let items = [];
						sites.forEach((site) => {
							items.push(site);
							if (site.items) {
								site.items.forEach((item) => {
									items.push({
										id: item._id,
										name: site.name + " - " + item.name
									});
								});
							}
						});
						return items;
					} else {
						return sites;
					}
				};

			}]);
}());
