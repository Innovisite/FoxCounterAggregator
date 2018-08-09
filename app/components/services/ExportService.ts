import { DataItem, DataElt } from "../types/data";
import { ViewableNode } from "../types/site";

declare const moment: any;
declare const _: any;

/**
 * @class ExportService
 * @memberOf FSCounterAggregatorApp
 * @description Allow formatting and exporting raw data
 */
export class ExportService {
    static colSeparator = ";";
    static lineSeparator = "\n";

    constructor() {
    }

    ConvertDataV1ToCSV(myData: DataItem[], sitesConf: ViewableNode[]) {
        function formatField(fieldName: string) {
            return fieldName == 'time' ?
                moment(this.time * 1000).format('YYYY-MM-DD HH:mm:ss') :
                this[fieldName];
        }

        function convertRawElementToCsvLine(prefix: string, elementsToExport: string[], rawElement: DataElt) {
            return prefix +
                _(elementsToExport)
                    .map(formatField.bind(rawElement))
                    .join(ExportService.colSeparator);
        }

        function getColumnsToExport(obj: DataElt) {
            return _.without(_.keys(obj), "occ");
        }

        const firstDataAvailable = _(myData)
            .map((x: DataItem) => { return x.data; })
            .flatten()
            .nth(0);

        const elementsToExport = getColumnsToExport(firstDataAvailable);
        const header = "Site" + ExportService.colSeparator + _.join(elementsToExport, ExportService.colSeparator) + ExportService.lineSeparator;

        const rawDataToExport = _(myData)
            .map((siteData: DataItem) => {
                const site = _.find(sitesConf, { id: siteData.id });
                const siteName = '"' + (site ? site.name || 'n/a' : 'n/a') + '"';

                return _(siteData.data)
                    .map(convertRawElementToCsvLine.bind(null, siteName + ExportService.colSeparator, elementsToExport))
                    .join(ExportService.lineSeparator);
            })
            .join(ExportService.lineSeparator);

        return header + rawDataToExport;
    };

    ConvertDataV2ToCSV(myData: DataItem[], sitesConf: ViewableNode[]) {
        const SiteNameConst:string = "Site";

        function groupElementsByDate(di : DataItem)
        {
            di = _.clone(di);
            di.data = _(di.data)
                    .map( (x : any)  => _.set({ time : x.time.end},  x.key, x.value))
                    .groupBy("time")
                    .map((arrayOfValues: any[]) => _.assign({}, ...arrayOfValues))                    
                    .value()

            return di;
        }
           
        
        function convertRawElementToCsvLine(elementsToExport: string[], rawElement: any) {
            return   _(elementsToExport)
                    .map( (key : string) => rawElement[key])
                    .join(ExportService.colSeparator);
        }

        const siteMap : { [id: string] : ViewableNode } = _.keyBy(sitesConf, "id");

        const groupedData = _.map(myData, groupElementsByDate);

        const flattenDataWithSite = _.flatMap(groupedData, (x: DataItem)=>_.map(x.data, (a:DataElt)=>_.set(a, SiteNameConst, siteMap[x.siteInfo.id].display_name)));
        const unorderColumnNames = flattenDataWithSite.reduce((acc : any, v : any) =>_.union(acc, _.keys(v)), []);
        const columnsNameWithoutSite = _.without(unorderColumnNames, SiteNameConst);
        const columnsName = [SiteNameConst, ...columnsNameWithoutSite];


        const header = _.join(columnsName, ExportService.colSeparator) + ExportService.lineSeparator;
        const rawDataToExport = _(flattenDataWithSite)
            .map(convertRawElementToCsvLine.bind(null, columnsName))
            .join(ExportService.lineSeparator);

        return header + rawDataToExport;        
    };

    //cf. http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side#24922761
    ProposeToDownload(content: any, fileName: string, mimeType: string) {
        const a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([content], {
                type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]                   
            a.href = URL.createObjectURL(new Blob([content], {
                type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
        }
    }
}   