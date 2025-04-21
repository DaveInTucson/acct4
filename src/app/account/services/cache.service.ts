import { Injectable } from '@angular/core';
import { SearchFlags, SearchParms } from 'src/app/model/search';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private searchFlags: SearchFlags | null = null;
  private searchParms: SearchParms | null = null;

  constructor() { }

  getSearchFlags() : SearchFlags | null
  { 
    let cached = localStorage.getItem('searchFlags');
    if (cached) {
      let sf = new SearchFlags();
      sf.setFromJSON(cached);
      return sf;
    }

    return null;
  }

  getSearchParms() : SearchParms | null
  { 
    let cached = localStorage.getItem('searchParms');
    if (cached)
      return JSON.parse(cached);

    return null;
  }

  setSearchParms(searchFlags: SearchFlags, searchParms: SearchParms | null)
  { 
    this.searchFlags = searchFlags;
    this.searchParms = searchParms; 
    localStorage.setItem('searchFlags', JSON.stringify(searchFlags));
    localStorage.setItem('searchParms', JSON.stringify(searchParms));
  }
}
