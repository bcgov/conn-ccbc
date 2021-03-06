-- Deploy cif:computed_columns/project_revision_project_contact_form_changes to pg

begin;

create or replace function cif.project_revision_project_contact_form_changes(project_revision cif.project_revision)
returns setof cif.form_change
as
$computed_column$

  select *
    from cif.form_change
    where project_revision_id = project_revision.id
      and form_data_schema_name='cif'
      and form_data_table_name='project_contact';

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_contact_form_changes to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_contact_form_changes is 'Computed column for graphql to retrieve the change related to the project_contact records, within a project revision';

commit;
