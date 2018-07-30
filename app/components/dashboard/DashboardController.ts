import { DashboardParamsService } from "../services/DashboardParamsService";
import { ExportService } from "../services/ExportService";

declare const window: any;

/*
 * Manage the dashboard data
 **/
function DashboardController(
    $scope: any,
    paramsService: DashboardParamsService,
    exportService: ExportService
) {

    $scope.params = paramsService;

    $scope.params.loadParams().then(function () {
        $scope.params.loadData()
            .then(() => true);
    });

    $scope.switchTimeZone = function () {
        $scope.params.useTimeZone = !$scope.params.useTimeZone;
        $scope.params.reloadData();
    };

    $scope.exportPrint = function () {
        window.print();
    };

    $scope.exportCurrentData = function () {
        const dateFormat = "YYYY-MM-DD";
        const fileName = "RawData_" + $scope.params.period.startDate.format(dateFormat) +
            "__" + $scope.params.period.endDate.format(dateFormat) + ".csv";
        // fab: we have to refactor ExportService for DataItemV2 type i.e $scope.params.data
        // const csvData = exportService.ConvertDataToCSV($scope.params.data, $scope.params.sites);
        // exportService.ProposeToDownload(csvData, fileName, 'text/csv;encoding:utf-8');
    };

}

(<any>DashboardController).$inject = ["$scope", "DashboardParamsService", "ExportService"];

export = DashboardController;