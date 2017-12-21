/**
 * @class DataService
 * @memberOf FSCounterAggregatorApp
 * @description Get Data from server
 */
(function() {

    angular.module('FSCounterAggregatorApp').service('DataService', [
        "$http",
        "$q",
        "UserService",
        "myconfig",
        function(
            $http,
            $q,
            UserService,
            myconfig
        ) {

            function get_items_api_period_feature(itemId, period, feature) {
                return $http.get("/items/" + itemId + "/" + feature, {
                    params: {
                        start: period.startDate.unix(),
                        end: period.endDate.unix()
                    }
                }).
                then(function(ret) {
                    return {
                        id: itemId,
                        data: ret.data
                    };
                });
            }; 

            this.getCountDataForItemInInterval = function(itemId, period) {
                if (myconfig.debug) {
                    return $q.when({}).
                    then(function() {
                        // add rnd
                        //
                        var getData = Math.random();
                        if (getData > 1) { // to enabled random use value inside [0;1[
                            return {
                                id: itemId,
                                data: []
                            };
                        }

                        var retData = [];
                        for (var ts = period.startDate.clone(); ts.unix() < period.endDate.unix(); ts.add(15, "m")) {
                            retData.push({
                                "in": Math.floor(50 * Math.random()),
                                "out": Math.floor(50 * Math.random()),
                                "time": ts.unix(),
                                "duration": 900
                            });
                        }
                        return {
                            id: itemId,
                            data: retData
                        };
                    });
                } else {
                    return get_items_api_period_feature(itemId, period, "countdata");
                }
            };

            /**
             * @function getHeatMapDataForItemInInterval
             * @description retrieve heatmap data for an item within
             * a period of time
             */
            this.getHeatMapDataForItemInInterval = function(itemId, period) {
                if (myconfig.debug) {
                    return $http.get("assets/heatmap_01.json")
                        .then(function(ret) {

                            var retData = [];
                            for (var ts = period.startDate.clone(); ts.unix() < period.endDate.unix(); ts.add(1, "days")) {
                                retData.push({
                                    "time": ts.unix(),
                                    "duration": 86400,
                                    data: ret.data.map((elt) => {
                                        return elt.map(e => e + 0.2 * e * Math.random());
                                    })
                                })
                            }

                            return {
                                id: itemId,
                                data: retData
                            }
                        });
                } else {
                    return get_items_api_period_feature(itemId, period, "rawdata");
                }
            };            

            /**
             * @function getHeatMapDataForSiteInInterval
             * @description retrieve all items heatmap data for a specific site within
             * a period of time
             */
            this.getHeatmapDataForSiteInInterval = function(site, period) {
                let promises = [];
                site.items.forEach((item) => {
                    promises.push(this.getHeatMapDataForItemInInterval(item._id, period));
                });
                return $q.all(promises).then((dataElts) => {
                    return {
                        id: site.id,
                        data: dataElts
                    }
                });
            };

            /**
             * @function getRawDataForSiteInInterval
             * @memberOf FSCounterAggregatorApp.DataService
             * @description retrieve data for an unique site
             * within a period of time
             */
            this.getRawDataForSiteInInterval = function(site, period) {
                if (UserService.isSiteHaveHeatmap(site)) {
                    return $q.all([
                        this.getCountDataForItemInInterval(site.id, period),
                        this.getHeatmapDataForSiteInInterval(site, period)
                    ]).then((dataElts) => {
                        return {
                            id: site.id,
                            data: dataElts[0].data,
                            heatmap: dataElts[1].data
                        };
                    });
                } else {
                    return this.getCountDataForItemInInterval(site.id, period);
                }
            };

            /**
             * @function getRawDataForSitesInInterval
             * @memberOf FSCounterAggregatorApp.DataService
             * @description retrieve data for a set of sites
             * within a period of time
             */
            this.getRawDataForSitesInInterval = function(sites, period) {
                let promises = [];
                sites.forEach((site) => {
                    promises.push(this.getRawDataForSiteInInterval(site, period));
                    site.items.forEach((item) => {
                        promises.push(this.getCountDataForItemInInterval(item._id, period))
                    });
                });
                return $q.all(promises);
            };

            /**
             * @function getRawDataForSitesInIntervals
             * @memberOf FSCounterAggregatorApp.DataService
             * @description retrieve data for a set of sites
             * each with a specific period of time
             */
            this.getRawDataForSitesInIntervals = function(sites, periods) {
                let promises = [];
                for (let i = 0; i < sites.length; ++i) {
                    promises.push(this.getRawDataForSiteInInterval(sites[i], periods[i]));
                    site.items.forEach((item) => {
                        promises.push(this.getCountDataForItemInInterval(item._id, periods[i]))
                    });
                }
                return $q.all(promises);
            };

            /**
             * @function getFakeHeatMapData
             * simply returns a promise on the heatmap data stored locally
             */
            this.getFakeHeatMapData = function(siteInfoHeatMap) {
                return $http.get(siteInfoHeatMap.data)
                    .then(function(ret) {
                        return ret.data;
                    });
            };

        }
    ]);

}());