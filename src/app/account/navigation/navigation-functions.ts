import { Router } from "@angular/router"
import { makeRouterSearchQueryParms, SearchParms } from "src/app/model/search";

export function navigateToAccountEdit(router: Router, accountID: number) {
    router.navigate([`/account/edit/${accountID}`]);
}

export function navigateToAccountStatement(router: Router, accountID: number, fromDate: string | null, toDate: string | null) {
    router.navigate([`/account/statement/${accountID}`], 
      { queryParams: { from: fromDate, to: toDate}});
}

export function navigateToGroupCreate(router: Router) {
    router.navigate(['/group/create']);
}

export function navigateToGroupEdit(router: Router, groupID: number) {
    router.navigate([`/group/edit/${groupID}`]);
}

export function navigateToInAndOut(router: Router, groupID: number, fromDate: string | null, toDate: string | null) {
    router.navigate([`/group/in-and-out/${groupID}`],
        { queryParams: { from: fromDate, to: toDate }});
}

export function navigateToGroupSummary(router: Router, groupID: number, fromDate: string | null, toDate: string | null) {
    router.navigate([`/group/summary/${groupID}`],
        { queryParams: { from: fromDate, to: toDate }});
}

export function navigateToSearch(router: Router) {
    router.navigate(['/search']);
}

export function navigateToSearchResults(router: Router, searchParms: SearchParms) {
    router.navigate(['/search-results'], { queryParams: makeRouterSearchQueryParms(searchParms)});
}