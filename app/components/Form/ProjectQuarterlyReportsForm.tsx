import { Button } from "@button-inc/bcgov-theme";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import quarterlyReports from "pages/cif/project-revision/[projectRevision]/form/quarterly-reports";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import quarterlyReportSchema from "data/jsonSchemaForm/quarterlyReportSchema";
import { ProjectQuarterlyReportsForm_projectRevision$key } from "__generated__/ProjectQuarterlyReportsForm_projectRevision.graphql";
import { ProjectQuarterlyReportsForm_query$key } from "__generated__/ProjectQuarterlyReportsForm_query.graphql";
import SavingIndicator from "./SavingIndicator";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import FormBase from "./FormBase";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectQuarterlyReportsForm_projectRevision$key;
}

const quarterlyReportUiSchema = {
  dueDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  submittedDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  comments: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
};

const ProjectQuarterlyReportsForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  //brianna --why can't I see quarterlyReportFormChanges in postgraphiql?
  //brianna--change to projectQuarterlyReportFormChanges (project prefix) for consistency?
  const projectRevision = useFragment(
    graphql`
      fragment ProjectQuarterlyReportsForm_projectRevision on ProjectRevision {
        id
        rowId
        projectQuarterlyReportFormChanges(first: 500)
          @connection(key: "connection_projectQuarterlyReportFormChanges") {
          __id
          edges {
            node {
              id
              newFormData
              operation
              changeStatus
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  //brianna --do we need an all forms like ProjectContactForm? That one uses primary/secondary

  ///////////mutations to-do:
  //   const [addQuarterlyReportMutation, isAdding] =
  //     useAddQuarterlyReportToRevision();

  //   const [applyUpdateFormChangeMutation, isUpdating] =
  //     useUpdateQuarterlyReportFormChange();

  //   const [discardFormChange] = useDiscardFormChange(
  //     projectQuarterlyReportsFormChanges.__id
  //   );

  ////////onclick functions - add, delete, update, stage

  return (
    <div>
      <header>
        <h2>Project Quarterly Reports</h2>

        {/* <SavingIndicator isSaved={!isUpdating && !isAdding} /> */}
      </header>

      <Grid cols={10} align="center">
        <Grid.Row>Quarterly reports status here</Grid.Row>
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder>
              <Grid.Row>
                <Button variant="secondary">
                  <FontAwesomeIcon icon={faPlusCircle} /> Add another quarterly
                  report
                </Button>
              </Grid.Row>
              <label>Quarterly Reports</label>
              {projectRevision.projectQuarterlyReportFormChanges.edges.map(
                ({ node }) => {
                  console.log("node is", node);
                  return (
                    <Grid.Row key={node.id}>
                      <Grid.Col span={6}>
                        <FormBase
                          id={`form-${node.id}`}
                          idPrefix={`form-${node.id}`}
                          ref={(el) => (formRefs.current[node.id] = el)}
                          formData={node.newFormData}
                          onChange={(change) => {
                            console.log("change is", change);
                            //   updateFormChange(
                            //     { ...form, changeStatus: "pending" },
                            //     change.formData
                            //   );
                          }}
                          schema={quarterlyReportSchema as JSONSchema7}
                          uiSchema={quarterlyReportUiSchema}
                          ObjectFieldTemplate={EmptyObjectFieldTemplate}
                        />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Button
                          variant="secondary"
                          size="small"
                          // onClick={() => deleteContact(form.id, form.operation)}
                        >
                          Remove
                        </Button>
                      </Grid.Col>
                    </Grid.Row>
                  );
                }
              )}
              {/* <Grid.Row>
                  <Grid.Col span={10}>
                    <Button
                      style={{ marginRight: "auto" }}
                      onClick={() =>
                        // allForms is already sorted by contactIndex
                        addContact(
                          allForms[allForms.length - 1].newFormData.contactIndex +
                            1
                        )
                      }
                    >
                      Add
                    </Button>
                  </Grid.Col>
                </Grid.Row> */}

              <Grid.Row>
                <Button
                  size="medium"
                  variant="primary"
                  // onClick={stageContactFormChanges}
                  //   disabled={isUpdating}
                >
                  Submit Quarterly Reports
                </Button>
              </Grid.Row>
            </FormBorder>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
      `}</style>
    </div>
  );
};

export default ProjectQuarterlyReportsForm;
