begin;

select plan(2);

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending');
insert into cif.form_change(id, form_data_schema_name, form_data_table_name, project_revision_id)
  overriding system value
  values (1, 'cif', 'project_manager', 1), (2, 'cif', 'project', 1), (3, 'test_schema_name', 'project', 1);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select form_data_table_name from cif.project_revision_project_manager_form_change((select * from record))
  ),
  'project_manager',
  'Only returns the form change record for the project_manager'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select form_data_table_name from cif.project_revision_project_manager_form_change((select * from record))
  ),
  null,
  'Returns null if there is no form change for the project_manager table'
);

select finish();

rollback;
