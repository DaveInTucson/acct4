create or replace view vdcu as
    select * from view_debit_card_use where date_posted >= first_of_month(curdate());