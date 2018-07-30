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

    constructor() {
    }

    ConvertDataToCSV(myData: DataItem[], sitesConf: ViewableNode[]) {

        const colSeparator = ";";
        const lineSeparator = "\n";

        function formatField(fieldName: string) {
            return fieldName == 'time' ?
                moment(this.time * 1000).format('YYYY-MM-DD HH:mm:ss') :
                this[fieldName];
        }

        function convertRawElementToCsvLine(prefix: string, elementsToExport: string[], rawElement: DataElt) {
            return prefix +
                _(elementsToExport)
                    .map(formatField.bind(rawElement))
                    .join(this.colSeparator);
        }

        function getColumnsToExport(obj: DataElt) {
            return _.without(_.keys(obj), "occ");
        }

        const firstDataAvailable = _(myData)
            .map((x: DataItem) => { return x.data; })
            .flatten()
            .nth(0);

        const elementsToExport = getColumnsToExport(firstDataAvailable);
        const header = "Site" + colSeparator + _.join(elementsToExport, colSeparator) + lineSeparator;

        const rawDataToExport = _(myData)
            .map((siteData: DataItem) => {
                const site = _.find(sitesConf, { id: siteData.id });
                const siteName = '"' + (site ? site.name || 'n/a' : 'n/a') + '"';

                return _(siteData.data)
                    .map(convertRawElementToCsvLine.bind(null, siteName + colSeparator, elementsToExport))
                    .join(lineSeparator);
            })
            .join(lineSeparator);

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