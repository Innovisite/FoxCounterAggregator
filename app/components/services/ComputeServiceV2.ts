declare const moment: any;

import { DataEltV2 } from '../types/data';

/**
* @function cApplyLocalTimezone
* @memberOf FSCounterAggregatorApp.ComputeService
* @description Apply an time offset to sync data to a local timezone
* To get this working we need to apply the offset in seconds between the original timezone 
* and the local timezone.
*/
export function cApplyLocalTimezone(data: DataEltV2[], tzSrc: string) {
    const offsetInSeconds = (moment.tz(tzSrc).utcOffset() - moment().utcOffset()) * 60;
    if (offsetInSeconds !== 0) {
        for (let i = 0; i < data.length; ++i) {
            const elt = data[i];
            elt.time.start = moment(elt.time.start).add(offsetInSeconds, 'seconds').format();
            elt.time.end = moment(elt.time.end).add(offsetInSeconds, 'seconds').format();
        }
    }
};