interface AccountGroup {
    id: number;
    name: String;
    parent_id: number | null;
    member_ids: number[];
};
