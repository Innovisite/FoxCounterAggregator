declare const angular: any;
declare const _: any;

import { UserSettings, UserLiveModeConfig } from '../types/user';
import { ViewableNode } from '../types/site';

export class UserService {

    static $inject = ["$http", "$resource", "myconfig"];

    private currentUserData: UserSettings;

    constructor(private $http: any, private $resource: any, private myconfig: any) {

    }

    getLiveMode(): UserLiveModeConfig {
        return this.currentUserData ? this.currentUserData.app_data.live_mode : undefined;
    }

    /**
	 * @function getSettings
	 * @memberOf FSCounterAggregatorApp.UserService
	 * @description retrieve the user settings and cached them
	 */
    getSettings(): Promise<UserSettings> {
        const url = this.myconfig.debug ? "assets/self.json" : "/api/v1/self";
        return this.$http.get(url).
            then((ret: any) => {                
                this.currentUserData = ret.data;
                return ret.data;
            });
    }

    /**
    * @function setSettings
    * @memberOf FSCounterAggregatorApp.UserService
    * @description change some of the user settings such as name
    */
    setSettings(params: any) {
        if (this.myconfig.debug) {
            return this.getSettings();
        } else {
            return this.$http.patch('/api/v1/users/' + this.currentUserData.id, params);
        }
    }

    /**
    * @function setPassword
    * @memberOf FSCounterAggregatorApp.UserService
    * @description change the current user password
    */
    setPassword(params: any) {
        if (this.myconfig.debug) {
            return this.getSettings();
        } else {
            return this.$http.patch('/api/v1/users/' + this.currentUserData.id, params);
        }
    }

    /**
    * @function getCachedSettings
    * @memberOf FSCounterAggregatorApp.UserService
    * @description get the cached user settings (a call to getSettings must be done previously)
    */
    getCachedSettings() {
        return this.currentUserData;
    }

    getSites() {
        return this.getCachedSettings().viewable_nodes;
    }

    getResource() {
        if (this.myconfig.debug) {

            const fakeResource = this.$resource('assets/users.json');
            angular.extend(fakeResource.prototype,
                {
                    '$save': function () {
                        return {};
                    },
                    '$delete': function () {
                        return {};
                    },
                    '$resetPassword': function () {
                        return {};
                    }
                });
            return fakeResource;            
        } else {
            return this.$resource('/api/v1/users/:userId',
                { userId: '@id' },
                {
                    'update':   {method: 'PATCH'},
                    resetPassword: {
                        method: 'PATCH',
                        url: '/api/v1/users/:userId'
                    }
                });
        }
    }

    getIdOfFirstSiteWithAdminRights(siteLists: any) {
        if (!siteLists) {
            return null;
        }
        const elem = _.find(siteLists, "isadmin", true);
        return elem ? elem._id : null;
    }

    getSiteFromId(siteLists: any, id: string) {
        return _.find(siteLists, "_id", id);
    }

    getFirstSiteAdmin(siteLists: any) {
        return _.find(siteLists, "isadmin", true);
    }

    isSiteAdmin(site: any) {
        return site.isadmin;
    }

    isSiteHaveHeatmap(site: ViewableNode) {
        return site.app_data !== undefined && site.app_data.heatmap !== undefined;
    }

}