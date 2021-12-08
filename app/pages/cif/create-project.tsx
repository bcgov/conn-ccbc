import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { createProjectQuery } from "__generated__/createProjectQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import updateFormChangeMutation from "mutations/FormChange/updateFormChange";
import { useRouter } from "next/router";
import ProjectForm from "components/Project/ProjectForm";
import { Button } from "@button-inc/bcgov-theme";
import Grid from "@button-inc/bcgov-theme/Grid";
import { useState } from "react";

const CreateProjectQuery = graphql`
  query createProjectQuery($id: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      formChange(id: $id) {
        id
        newFormData
      }
    }
  }
`;

export function CreateProject({
  preloadedQuery,
}: RelayProps<{}, createProjectQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(CreateProjectQuery, preloadedQuery);

  const [errors, setErrors] = useState({});

  if (!query.formChange.id) return null;

  // Function: stage the change data in the form_change table
  const storeResult = async (data) => {
    const variables = {
      input: {
        id: query.formChange.id,
        formChangePatch: {
          newFormData: data,
        },
      },
    };
    await updateFormChangeMutation(preloadedQuery.environment, variables);
  };

  // The applyChangeFromComponent function will require this page to be aware of the state of the newFormData object
  const formChangeData = query.formChange.newFormData;

  // A function to be called by individual components making changes to the overall form_change data
  const applyChangesFromComponent = (changeObject: any) => {
    const updatedFormData = { ...formChangeData, ...changeObject };
    storeResult(updatedFormData);
  };

  const onFormErrors = (incomingErrors: {}) => {
    setErrors({ ...errors, ...incomingErrors });
  };

  // Function: approve staged change, triggering an insert on the project table & redirect to the project page
  const commitProject = async () => {
    await updateFormChangeMutation(preloadedQuery.environment, {
      input: {
        id: query.formChange.id,
        formChangePatch: { changeStatus: "committed" },
      },
    });
    await router.push({
      pathname: "/cif/projects",
    });
  };

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <h1>Create Project</h1>
      <Grid cols={2}>
        <Grid.Row>
          <Grid.Col>
            <ProjectForm
              formData={query.formChange.newFormData}
              onChange={applyChangesFromComponent}
              onFormErrors={onFormErrors}
            />
          </Grid.Col>
        </Grid.Row>

        <Button
          size="medium"
          variant="primary"
          onClick={commitProject}
          disabled={Object.values(errors).some((val) => val)}
        >
          Commit Project Changes
        </Button>
      </Grid>
    </DefaultLayout>
  );
}

export default withRelay(CreateProject, CreateProjectQuery, withRelayOptions);
