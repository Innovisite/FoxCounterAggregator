import { ViewableNode } from "../types/site";
import { QueryPeriod, DataItem } from "../types/data";
import { DashboardParamsService, DashboardParams } from '../services/DashboardParamsService';
import { USER_LIVE_REFRESH_RATE, UserLiveModeConfig } from "../types/user";

declare const angular: any;
declare const moment: any;

/**
 * @class LiveModeController
 * @memberOf FSCounterAggregatorApp
 */
function LiveModeController($scope: any, $interval: any, $paramsService: DashboardParamsService) {

    let liveStopPromise: any;

    // use this variable to prevent multiple calls during live mode    
    let dataLoadingLock: boolean = false;

    this.params = {
        sites: [],
        data: [],
        comparedData: [],
        period: undefined,
        comparedPeriod: undefined
    } as DashboardParams;    

    $scope.init = (params: DashboardParams) => {

        this.params = Object.assign({}, params);    

        $scope.$watch('params.liveConfig', (newConfig: UserLiveModeConfig) => {
            if (newConfig !== undefined && newConfig.enabled) {
                this.startLive();
            } else {
                this.stopLive();
            }
        });        

        $scope.$watch('params.period', (newData: QueryPeriod) => {
            if (newData !== undefined) {
                this.params.period = newData;              
            }
        });

        $scope.$watch('params.data', (newData: DataItem[]) => {
            if (newData !== undefined && newData.length) {
                if (liveStopPromise) {
                    this.params.data = newData.map(elt => Object.assign({}, elt, { data: [elt.data[elt.data.length - 1]] }));
                } else {
                    this.params.data = newData;
                }
            }
        });

        $scope.$on('$destroy', () => {
            this.stopLive();
        });

        return this.params;
    };

    this.stopLive = () => {
        if (angular.isDefined(liveStopPromise)) {
            $interval.cancel(liveStopPromise);
            liveStopPromise = undefined;
            dataLoadingLock = false;
        }
    };

    this.startLive = () => {
        this.stopLive();
        liveStopPromise = $interval(() => {
            if (this.params.period.endDate.isSame(moment(), 'day')) {
                this.reloadDataCheckLock();
            }
        }, $paramsService.liveConfig.refresh_rate || USER_LIVE_REFRESH_RATE);
    };

    this.reloadDataCheckLock = () => {
        if (!dataLoadingLock) {
            console.log("LIVE MODE RELOAD = ", moment());
            dataLoadingLock = true;
            $paramsService.reloadDataWithParams(this.params)
                .then(() => dataLoadingLock = false, () => dataLoadingLock = false);
        }
    };
}

(<any>LiveModeController).$inject = ["$scope", "$interval", "DashboardParamsService"];

export = LiveModeController;
