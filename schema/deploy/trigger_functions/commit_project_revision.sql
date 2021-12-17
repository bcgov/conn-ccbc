-- Deploy cif:trigger_functions/commit_project_revision to pg

begin;

create or replace function cif_private.commit_project_revision()
returns trigger as $$
declare
begin

  -- Propagate the change_status to all related form_change records
  -- Save the project table first do avoid foreign key violations from other potential tables.
  update cif.form_change
    set change_status = new.change_status
    where project_revision_id=new.id
    and form_data_table_name='project';

  update cif.form_change
    set change_status = new.change_status
    where project_revision_id=new.id
    and form_data_table_name!='project';

  -- If a project_id wasn't created, save it after the form_change row was committed
  if (select triggers_commit from cif.change_status where status=new.change_status) and (new.project_id is null) then
      update cif.project_revision set project_id=(
          select form_data_record_id
            from cif.form_change
            where project_revision_id=new.id
              and form_data_table_name='project'
              and form_data_schema_name='cif'
          )
        where id=new.id;
  end if;

  return new;

end;
$$ language plpgsql;


grant execute on function cif_private.commit_project_revision to cif_internal, cif_external, cif_admin;


comment on function cif_private.commit_project_revision()
  is $$
  A trigger that updates the state of all the individual cif.form_change associated to the project_revision.
  It has no effect if the project_revision''s change_status doesn''t have triggers_commit set to true.
  $$;


commit;
