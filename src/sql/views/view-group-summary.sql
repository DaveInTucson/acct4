create or replace view view_group_summary as
    select group_id, date_posted, sum(if(type='d',amount,-amount)) delta 
    from view_group_combined
    group by group_id, date_posted;
