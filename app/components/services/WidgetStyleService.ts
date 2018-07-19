import { SiteItem } from "../types/site";

/**
 * @class WidgetStyleService
 * @memberOf FSCounterAggregatorApp
 * @description Retrieve rendering style information for widgets
 */
export class WidgetStyleService {

	static $inject = ["$http", "$q"];

	widgetStyles: any = {
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
		},
		"GaugeBoxWidget": {
			"json": "assets/gauge.json",
			"css": undefined,
			"cached": undefined
		}
	};

	constructor(private $http: any, private $q: any) {

	}

	/**
	* @function getStyle
	* @memberOf FSCounterAggregator.WidgetStyleService
	* @description retrieve style information for a particular widget
	*/
	getStyle(widgetId: string) {
		if (this.widgetStyles[widgetId] === undefined) {
			return this.$q.when({});
		} else if (this.widgetStyles[widgetId].json_cached !== undefined) {
			return this.$q.when(this.widgetStyles[widgetId].cached);
		} else {
			return this.$http.get(this.widgetStyles[widgetId].json).
				then((ret: any) => {
					this.widgetStyles[widgetId].cached = { "json": ret.data };
					return this.widgetStyles[widgetId].cached;
				});
		}
	}

	/**
 	* @function buildItemsList
 	* @memberOf FSCounterAggregator.WidgetStyleService
 	* @description Returns ids/labels pairs for a set of sites
 	* including items is specified. Mainly used for selection widget				 
 	*/
	buildItemsList(sites: SiteItem[], showItems: boolean) {
		if (showItems) {
			let items: SiteItem[] = [];
			sites.forEach((site) => {
				items.push(site);
				if (site.items) {
					site.items.forEach((item: any) => items.push(Object.assign({}, item, { name: site.name + " - " + item.name })));
				}
			});
			return items;
		} else {
			return sites;
		}
	}
}
