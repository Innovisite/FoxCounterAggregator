/**
* @class KPISumGeneric
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of the available indicators
*/

function KPISumGeneric($scope, $controller) {

  this.defaultFunc = "KPISum";

  this.kpis = {
  };

  this.avoid = [ "duration", "time", "nodeId", "key", "value" ];

  this.options = {
    indicators: [
    ]
  };

  this.setKPIFunc = function(id, func) {
    if(func === undefined) {
      func = this.defaultFunc;
    }
    this.kpis[id] = $controller(func,{"$scope":$scope});
  };

  this.getOptionFromId = function(id) {
    return this.options.indicators.find(function(elt) {
      return elt.id === id;
    });
  };

  this.addOption = function(id, name) {
    this.options.indicators.push({id: id, name: name});
  };

  this.setOption = function(id, name, func) {
    this.setKPIFunc(id, func);
    var elt = this.getOptionFromId(id);
    if(elt === undefined) {
      this.addOption(id, name);
    } else {
      elt.name = name;
    }
  };

  this.setOptions = function(options) {
    if(options.indicators !== undefined) {
      for(var i = 0; i < options.indicators.length; ++i) {
        var elt = options.indicators[i];
        this.setOption(elt.id, elt.name, elt.func);
      }
    }
  };

  this.updateIndicators = function(sitedata) {

    if(sitedata.data.length) {
      var elt = sitedata.data[0];
      for(var key in elt) {
        if(this.avoid.indexOf(key) === -1) {
          if(this.kpis[key] === undefined) {
            this.setKPIFunc(key);
          }
          if(this.getOptionFromId(key) === undefined) {
            this.addOption(key, key);
          }
        }
      }
    }
  };

  /**
  * @function haveKPI
  * @description return whether or not a kpi exists for this indicator
  */
  this.haveKPI = function(indicator) {
    return this.kpis[indicator] !== undefined;
  };

  /**
  * @function compute
  * @memberOf FSCounterAggregatorApp.KPISumMax
  */
  this.compute = function(query) {
    if(this.haveKPI(query.indicator)) {
      return this.kpis[query.indicator].compute(query);
    }
  };
}

KPISumGeneric.$inject = [ "$scope", "$controller" ];

module.exports = KPISumGeneric;
