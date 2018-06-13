/*
 * Transform a site id to its name (or "" if no site available)
 **/

(function() {

    require('../services/UserService');
    
 angular.module('FSCounterAggregatorApp')
    .filter("SiteName", ["UserService", function(UserService)
    {
        var addSiteName = function(siteId)
        {            
            var mySite = _.find(UserService.getSites(), function(site){
                return site.id == siteId;
            });

            return mySite ? mySite.display_name : "";
        };

        return addSiteName;
    }]);
}());
