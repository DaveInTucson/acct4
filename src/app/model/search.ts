import { HttpParams } from "@angular/common/http";
import { ParamMap } from "@angular/router";

export interface SearchParms {
  toType: 'account' | 'group' | '';
  toCmp: 'EQ' | 'NE' | '';
  toValue: number;
  fromType: 'account' | 'group' | '';
  fromCmp: 'EQ' | 'NE' | '';
  fromValue: number;
  statusCmp: 'EQ' | 'NE' | '';
  statusValue: 'cleared' | 'pending' | 'void' | '';
  fromDate: string | null;
  toDate: string | null;
  noteCmp: 'regexp' | 'not-regexp' | '';
  noteRE: string;
};

export class SearchFlags {
    filterFrom: boolean = false;
    filterTo: boolean = false;
    filterStatus: boolean = false;
    filterDate: boolean = false;
    filterNote: boolean = false;

    clear() {
        this.filterFrom = false;
        this.filterTo = false;
        this.filterStatus = false;
        this.filterDate = false;
        this.filterNote = false;
    }

    filterCount(): number {
        let count = 0;
        if (this.filterFrom) count++;
        if (this.filterTo) count++;
        if (this.filterStatus) count++;
        if (this.filterDate) count++;
        if (this.filterNote) count++;
        return count;
    }
 
    setFromJSON(json: string) : void {
        let object = JSON.parse(json);
        Object.assign(this, object);
    }
}

export function makeEmptySearchParms(): SearchParms {
    return {
        toType: '',
        toCmp: '',
        toValue: 0,
        fromType: '',
        fromCmp: '',
        fromValue: 0,
        statusCmp: '',
        statusValue: '',
        fromDate: null,
        toDate: null,
        noteCmp: '',
        noteRE: ''
    };
}

export function makeDefaultSearchParms(): SearchParms {
    return {
        toType: 'account',
        toCmp: 'EQ',
        toValue: 0,
        fromType: 'account',
        fromCmp: 'EQ',
        fromValue: 0,
        statusCmp: 'EQ',
        statusValue: 'cleared',
        fromDate: null,
        toDate: null,
        noteCmp: 'regexp',
        noteRE: ''
    };
}

export function makeRouterSearchQueryParms(searchParms: SearchParms) : Object {
    let qp : { [key: string] : string } = {};

    if (searchParms.fromType !== '') {
        qp['fromType'] = searchParms.fromType;
        qp['fromCmp'] = searchParms.fromCmp;
        qp['fromValue'] = searchParms.fromValue.toString();
    }
    if (searchParms.toType !== '') {
        qp['toType'] = searchParms.toType;
        qp['toCmp'] = searchParms.toCmp;
        qp['toValue'] = searchParms.toValue.toString();
    }

    if (searchParms.statusCmp !== '') {
        qp['statusCmp'] = searchParms.statusCmp;
        qp['statusValue'] = searchParms.statusValue;
    }

    if (searchParms.fromDate)
        qp['fromDate'] = searchParms.fromDate;
    if (searchParms.toDate)
        qp['toDate'] = searchParms.toDate;

    if (searchParms.noteCmp !== '') {
        qp['noteCmp'] = searchParms.noteCmp;
        qp['noteRE'] = searchParms.noteRE
    }
    
    return qp;
}

export function makeHttpSearchParams(searchParms: SearchParms) : HttpParams {
    let params = new HttpParams();

    if (searchParms.fromType !== '') {
        params = params.set('fromType', encodeURIComponent(searchParms.fromType));
        params = params.set('fromCmp', encodeURIComponent(searchParms.fromCmp));
        params = params.set('fromValue', encodeURIComponent(searchParms.fromValue));
    }

    if (searchParms.toType !== '') {
        params = params.set('toType', encodeURIComponent(searchParms.toType));
        params = params.set('toCmp', encodeURIComponent(searchParms.toCmp));
        params = params.set('toValue', encodeURIComponent(searchParms.toValue));
    }

    if (searchParms.statusCmp !== '') {
        params = params.set('statusCmp', encodeURIComponent(searchParms.statusCmp));
        params = params.set('statusValue', encodeURIComponent(searchParms.statusValue));
    }

    if (searchParms.fromDate)
        params = params.set('from_date', searchParms.fromDate);
    if (searchParms.toDate)
        params = params.set('to_date', searchParms.toDate);

    if (searchParms.noteCmp) {
        params = params.set('noteCmp', encodeURIComponent(searchParms.noteCmp));
        params = params.set('noteRE', encodeURIComponent(searchParms.noteRE));
    }

    return params;
}

function constrainAccountGroup(type: string | null) : 'account' | 'group' {
    if (type === null) throw new Error('account/group type cannot be null');
    if (type === 'account') return 'account';
    if (type === 'group') return 'group';
    throw new Error(`${type} is not account or group`);
}

export function constrainCmp(cmp: string | null) : 'EQ' | 'NE' {
    if (null === cmp) throw new Error('cmp cannot be null');
    if (cmp === 'EQ') return 'EQ';
    if (cmp === 'NE') return 'NE';
    throw new Error(`${cmp} is not EQ or NE`);
}

export function constrainRECmp(cmp: string | null) : 'regexp' | 'not-regexp' {
    if (null === cmp) throw new Error('cmp cannot be null');
    if (cmp === 'regexp') return 'regexp';
    if (cmp === 'not-regexp') return 'not-regexp';
    throw new Error(`${cmp} is not EQ or NE`);
}

function constrainStatusValue(status: string | null) : 'cleared' | 'pending' | 'void' {
    if (status) {
        switch (status) {
            case 'cleared' : return 'cleared';
            case 'pending' : return 'pending';
            case 'void' : return 'void';
        }
    }

    throw new Error(`${status} is not cleared, pending, or void`);
}

export function paramMap2SearchParams(paramMap: ParamMap) : SearchParms {
    let sp: SearchParms = makeEmptySearchParms();

    if (paramMap.has('fromType')) {
        sp.fromType = constrainAccountGroup(paramMap.get('fromType'));
        sp.fromCmp = constrainCmp(paramMap.get('fromCmp'));
        sp.fromValue = Number(paramMap.get('fromValue'));
    }

    if (paramMap.has('toType')) {
        sp.toType = constrainAccountGroup(paramMap.get('toType'));
        sp.toCmp = constrainCmp(paramMap.get('toCmp'));
        sp.toValue = Number(paramMap.get('toValue'));
    }

    if (paramMap.has('statusCmp')) {
        sp.statusCmp = constrainCmp(paramMap.get('statusCmp'));
        sp.statusValue = constrainStatusValue(paramMap.get('statusValue'));
    }
    
    sp.fromDate = paramMap.get('fromDate');
    sp.toDate = paramMap.get('toDate');

    if (paramMap.has('noteCmp')) {
        sp.noteCmp = constrainRECmp(paramMap.get('noteCmp'));
        sp.noteRE = paramMap.get('noteRE')!;
    }

    return sp;
}