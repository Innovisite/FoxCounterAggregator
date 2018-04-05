/**
 * @class SiteNavigationController
 * @memberOf FSCounterAggregatorApp
 */
function SiteNavigationController($scope, $controller) {

    this.params = undefined;
    this.originalSites = undefined;
    this.curIdx = 0;

    const that = this;

    $scope.init = function (params) {

        that.curIdx = 0;
        that.params = Object.assign({}, params);        

        $scope.$watch("params.sites", function (newSites, oldSites) {
            if (newSites !== undefined && newSites.length) {
                that.originalSites = newSites.slice(0);
                that.params.sites = [ that.originalSites[that.curIdx] ];
            }
        });

        $scope.$watch('params.data', function (newData, oldData) {
            that.params.data = newData;
        });

        $scope.$watch('params.comparedData', function (newData, oldData) {
            that.params.comparedData = newData;
        });

        return that.params;
    };

    this.test = function ($event) {        

        this.curIdx = ((this.curIdx+1) % this.originalSites.length);
        this.params.sites = [ this.originalSites[this.curIdx] ];

    };

}

SiteNavigationController.$inject = ["$scope", "$controller"];

module.exports = SiteNavigationController;
