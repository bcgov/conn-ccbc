import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectRevisionQuery } from "__generated__/ProjectRevisionQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Textarea, Alert } from "@button-inc/bcgov-theme";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useUpdateChangeReason } from "mutations/ProjectRevision/updateChangeReason";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";
import SavingIndicator from "components/Form/SavingIndicator";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  getProjectsPageRoute,
  getProjectRevisionOverviewFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import TaskList from "components/TaskList";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { useMemo } from "react";

const pageQuery = graphql`
  query ProjectRevisionQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        isFirstRevision
        changeReason
        changeStatus
        projectId
        ...ProjectFormSummary_projectRevision
        ...ProjectContactFormSummary_projectRevision
        ...ProjectManagerFormSummary_projectRevision
        ...TaskList_projectRevision
        projectByProjectId {
          latestCommittedProjectRevision {
            id
          }
        }
        formChangesByProjectRevisionId {
          edges {
            node {
              validationErrors
            }
          }
        }
      }
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, ProjectRevisionQuery>) {
  const router = useRouter();
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const [updateChangeReason, updatingChangeReason] = useUpdateChangeReason();

  const [updateProjectRevision, updatingProjectRevision] =
    useMutationWithErrorMessage(
      updateProjectRevisionMutation,
      () => "An error occurred while attempting to update the project revision."
    );
  const [discardProjectRevision, discardingProjectRevision] =
    useDeleteProjectRevisionMutation();

  const hasValidationErrors = useMemo(
    () =>
      query.projectRevision?.formChangesByProjectRevisionId.edges.some(
        (edge) => edge.node.validationErrors.length > 0
      ),
    [query.projectRevision?.formChangesByProjectRevisionId.edges]
  );
  const isCommittedRevision =
    query.projectRevision?.changeStatus === "committed";
  useEffect(() => {
    if (isCommittedRevision)
      router.push(
        getProjectRevisionOverviewFormPageRoute(query.projectRevision.id)
      );
  }, [isCommittedRevision, query, router]);

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting || isCommittedRevision) return null;

  /**
   *  Function: approve staged change, trigger an insert on the project
   *  table & redirect to the project page
   */
  const commitProject = async () => {
    updateProjectRevision({
      variables: {
        input: {
          id: query.projectRevision.id,
          projectRevisionPatch: { changeStatus: "committed" },
        },
      },
      // No need for an optimistic response
      // Since we navigate away from the page after the mutation is complete
      onCompleted: async () => {
        await router.push(getProjectsPageRoute());
      },
      updater: (store) => {
        // Invalidate the entire store,to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  const handleChange = (e) => {
    return new Promise((resolve, reject) =>
      updateChangeReason({
        variables: {
          input: {
            id: query.projectRevision.id,
            projectRevisionPatch: { changeReason: e.target.value },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id: query.projectRevision.id,
              changeReason: e.target.value,
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
        debounceKey: query.projectRevision.id,
      })
    );
  };

  const discardRevision = async () => {
    await discardProjectRevision({
      variables: {
        input: {
          id: query.projectRevision.id,
        },
      },
      onCompleted: async () => {
        if (query.projectRevision.isFirstRevision)
          await router.push(getProjectsPageRoute());
        else
          await router.push(
            getProjectRevisionPageRoute(
              query.projectRevision.projectByProjectId
                .latestCommittedProjectRevision.id
            )
          );
      },
      onError: async (e) => {
        console.error("Error discarding the project", e);
      },
    });
  };

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <div>
        <header>
          <h2>Review and Submit Project</h2>
          {showDiscardConfirmation && (
            <Alert variant="danger" size="sm">
              All changes made will be permanently deleted.
              <a id="confirm-discard-revision" onClick={discardRevision}>
                Proceed
              </a>
              <a onClick={() => setShowDiscardConfirmation(false)}>Cancel</a>
            </Alert>
          )}
          {!showDiscardConfirmation && (
            <Button
              id="discard-project-button"
              size="small"
              variant="secondary"
              onClick={() => setShowDiscardConfirmation(true)}
              disabled={updatingProjectRevision || discardingProjectRevision}
            >
              <FontAwesomeIcon icon={faTrash} id="discard-project-icon" />
              Discard Project Revision
            </Button>
          )}
        </header>
        <ProjectFormSummary projectRevision={query.projectRevision} />
        <ProjectManagerFormSummary projectRevision={query.projectRevision} />
        <ProjectContactFormSummary projectRevision={query.projectRevision} />

        {query.projectRevision.projectId && (
          <div>
            {query.projectRevision.changeStatus === "committed" ? (
              <>
                <h4>Reason for change</h4>
                <p>{query.projectRevision.changeReason}</p>
              </>
            ) : (
              <>
                <h4>Please describe the reason for these changes</h4>
                <SavingIndicator isSaved={!updatingChangeReason} />
                <Textarea
                  value={query.projectRevision.changeReason}
                  onChange={handleChange}
                  size={"medium"}
                  resize="vertical"
                />
              </>
            )}
          </div>
        )}
        {query.projectRevision.changeStatus !== "committed" && (
          <>
            <Button
              size="medium"
              variant="primary"
              onClick={commitProject}
              disabled={
                hasValidationErrors ||
                updatingProjectRevision ||
                discardingProjectRevision ||
                updatingChangeReason ||
                (query.projectRevision.projectId &&
                  !query.projectRevision.changeReason)
              }
            >
              Submit
            </Button>
          </>
        )}
      </div>
      <style jsx>{`
        div :global(.pg-button) {
          margin-right: 3em;
        }
        :global(textarea) {
          width: 100%;
          min-height: 10rem;
        }
        div :global(.pg-textarea) {
          padding-top: 2px;
        }
        h4 {
          margin-bottom: 0;
        }
        div :global(#discard-project-icon) {
          color: #323a45;
          margin-right: 0.5em;
        }
        div :global(#discard-project-button) {
          margin-bottom: 1em;
          color: #cd2026;
        }
        div :global(#discard-project-button:hover) {
          background-color: #aeb0b5;
        }
        div :global(.pg-notification) {
          margin-bottom: 1em;
        }
        div :global(a) {
          color: #1a5a96;
        }
        div :global(a:hover) {
          text-decoration: none;
          color: blue;
          cursor: pointer;
        }
        div :global(#confirm-discard-revision) {
          margin-left: 2em;
          margin-right: 1em;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
