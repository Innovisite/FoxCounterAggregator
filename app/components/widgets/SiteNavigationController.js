/**
 * @class SiteNavigationController
 * @memberOf FSCounterAggregatorApp
 */
function SiteNavigationController($scope, $controller, $paramsService) {

    this.params = undefined;
    this.originalSites = undefined;
    this.originalData = undefined;
    this.originalCompData = undefined;

    const that = this;

    $scope.init = function (params) {

        that.params = Object.assign({}, params);

        $scope.$watch("params.sites", function (newSites, oldSites) {
            if (newSites !== undefined && newSites.length) {
                that.originalSites = newSites.slice(0);
                that.params.sites = that.originalSites;
            } else {
                that.params.sites = newSites;
            }
        });

        $scope.$watch('params.data', function (newData, oldData) {        
            if (newData !== undefined && newData.length) {
                that.originalData = newData.slice(0);
                that.params.data = that.originalData;
            } else {
                that.params.data = newData;
            }
        });

        $scope.$watch('params.comparedData', function (newData, oldData) {
            if (newData != undefined && newData.length) {
                that.originalCompData = newData.slice(0);
                that.params.comparedData = that.originalCompData;
            } else {
                that.params.comparedData = newData;
            }
        });

        return that.params;
    };

    this.goNav = function ($event) {
        
        if ($event.path.length) {
            let subPart = { items: this.originalSites };
            $event.path.split("/")
                .forEach(elt => {
                    subPart = subPart.items.find(item => (item.id == elt) || (item._id == elt));
                });
            // fab: TODO replace/add id with _id everywhere in order to simplify services APIs
            this.params.sites = subPart.items.map(site => Object.assign(site, { id: site._id }));
        } else {
            this.params.sites = this.originalSites;
        }        

        $paramsService.loadDataForSites(this.params.sites)
            .then(res => {                
                this.params.data = res[0];
                if(res[1]) {
                    this.params.comparedData = res[1];
                }
            });

    };

}

SiteNavigationController.$inject = ["$scope", "$controller", "DashboardParamsService"];

module.exports = SiteNavigationController;
