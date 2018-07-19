import { WidgetStyleService } from "../services/WidgetStyleService";
import { DataItem, QueryPeriod } from "../types/data";

/**
 * This is used as an inline controller for mono widget directive
 */
export class MonoWidgetCtrlBase {

	static $inject = ["$scope", "$filter", "WidgetStyleService"];

	constructor(protected $scope: any, protected $filter: any, protected widgetStyleService: WidgetStyleService) {
        
        this.$scope.label = this.$scope.label !== undefined ? this.$scope.label : this.$scope.kpi.getLabel(this.$scope.indicator);
		this.$scope.value = 0;
		this.$scope.valueCompared = 0;
		this.$scope.widgetId = 'statbox/' + this.$scope.kpi + '/' + this.$scope.indicator;
		this.$scope.liveMode = false;
		this.$scope.periodComparisonSelected = false;

		this.widgetStyleService.getStyle(this.$scope.widgetId)
			.then(function () {
			});

		this.initWatchers();
	}

    protected initWatchers() {
        this.$scope.$watch('params.data', (newData: DataItem[], oldData: DataItem[]) => {
			if (newData !== oldData) {
				this.update();
			}
		});

		this.$scope.$watch('params.comparedData', (newData: DataItem[]) => {
			if (newData !== undefined && newData.length) {
				this.$scope.periodComparisonSelected = true;
				this.updateCompared();
			} else if (this.$scope.periodComparisonSelected) {
				this.$scope.periodComparisonSelected = false;
			}
		});

		this.$scope.$watch('params.liveMode', (newValue: boolean, oldValue: boolean) => {
			if (newValue !== oldValue) {
				this.$scope.liveMode = newValue;
			}
		});

		this.$scope.$watch('params.currentSiteData', (newData: DataItem[], oldData: DataItem[]) => {
			if (newData !== oldData) {
				this.update();
			}
		});

		this.$scope.$watch('params.currentSiteComparedData', (newData: DataItem[]) => {
			if (newData !== undefined && newData.length) {
				this.$scope.periodComparisonSelected = true;
				this.updateCompared();
			} else if (this.$scope.periodComparisonSelected) {
				this.$scope.periodComparisonSelected = false;
			}
		});
    }

	protected applyFilters(value: any) {
		if (!this.$scope.displayFilters)
			return value;

		return this.$filter(this.$scope.displayFilters)(value);
	}

	protected getValue(data: DataItem[], period: QueryPeriod) {
		const res = this.$scope.kpi.compute({
			allsitedata: data.map((_: any) => _.data),
			period: period,
			indicator: this.$scope.indicator,
			groupBy: undefined,
			periodLive: this.$scope.liveMode
		});
		if (res.isSiteIndex) {
			res.value = this.$scope.params.sites[res.value].id;
		}
		return this.applyFilters(res.value);
	}

	protected update() {
		this.$scope.value = this.getValue(
			this.$scope.params.currentSiteData ? this.$scope.params.currentSiteData : this.$scope.params.data,
			this.$scope.params.period);
	}

	protected updateCompared() {
		if (this.$scope.periodComparisonSelected) {
			this.$scope.valueCompared = this.getValue(
				this.$scope.params.currentSiteComparedData ? this.$scope.params.currentSiteComparedData : this.$scope.params.comparedData,
				this.$scope.params.comparedPeriod);
		}
	}

}