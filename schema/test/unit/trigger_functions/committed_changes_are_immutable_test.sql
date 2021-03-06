begin;

select plan(4);

insert into cif.change_status (status, triggers_commit, active) values ('testcommitted', true, true), ('testpending', false, true);

create table test_table_with_status(
  test_col text,
  change_status varchar(1000) references cif.change_status
);

create trigger trigger_under_test before update on test_table_with_status for each row
execute procedure cif_private.committed_changes_are_immutable();

insert into test_table_with_status(test_col, change_status) values ('test_active', 'testpending'), ('test_committed', 'testcommitted');

select lives_ok(
  $$
    update test_table_with_status set test_col = 'test_changed_active' where test_col = 'test_active'
  $$,
  'doesnt throw on an update if the change status isn''t committed'
);

select is(
  (select count(*) from test_table_with_status where test_col = 'test_changed_active'),
  1::bigint,
  'allows the record to be updated if the change status isn''t committed'
);

select results_eq(
  $$
    with deleted as (
      delete from test_table_with_status where test_col = 'test_changed_active' returning *
    )
    select count(*) from deleted;
  $$,
  $$
  values (1::bigint)
  $$,
  'allows the record to be deleted if the change status isn''t committed'
);

select throws_ok(
  $$
    update test_table_with_status set test_col = 'test_changed_committed' where test_col = 'test_committed'
  $$,
  'Committed records cannot be modified',
  'throws if the change_status is committed'
);

select finish();

rollback;
