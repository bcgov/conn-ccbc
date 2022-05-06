import Link from "next/link";
import { useRouter } from "next/router";
import {
  getProjectRevisionContactsFormPageRoute,
  getProjectRevisionManagersFormPageRoute,
  getProjectRevisionOverviewFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";
import TaskListStatus from "./TaskListStatus";

interface Props {
  projectRevision: TaskList_projectRevision$key;
}

const TaskList: React.FC<Props> = ({ projectRevision }) => {
  const {
    id,
    projectByProjectId,
    changeStatus,
    projectOverviewStatus,
    projectManagersStatus,
    projectContactsStatus,
  } = useFragment(
    graphql`
      fragment TaskList_projectRevision on ProjectRevision {
        id
        changeStatus
        projectByProjectId {
          proposalReference
        }
        projectOverviewStatus
        projectContactsStatus
        projectManagersStatus
      }
    `,
    projectRevision
  );
  const router = useRouter();

  let mode =
    changeStatus === "committed"
      ? "view"
      : projectByProjectId
      ? "update"
      : "create";

  const currentStep = useMemo(() => {
    if (!router || !router.pathname) return null;
    if (`${router.pathname}/` === getProjectRevisionPageRoute(id).pathname)
      return "summary";
    const routeParts = router.pathname.split("/");
    return routeParts[routeParts.length - 1];
  }, [id, router]);

  const getFormListItem = (stepName, linkUrl, formTitle, formStatus) => {
    return (
      <li
        aria-current={currentStep === stepName ? "step" : false}
        className="bordered"
      >
        <Link href={linkUrl}>
          <a>
            {mode === "view" || stepName === "summary"
              ? formTitle
              : `${
                  mode === "update" ? "Edit" : "Add"
                } ${formTitle.toLowerCase()}`}
          </a>
        </Link>
        {mode !== "view" && <TaskListStatus formStatus={formStatus} />}

        <style jsx>{`
          li {
            text-indent: 15px;
            margin-bottom: 0;
            display: flex;
            justify-content: space-between;
          }
          li[aria-current="step"],
          li[aria-current="step"] div {
            background-color: #fafafc;
          }

          .bordered {
            border-bottom: 1px solid #d1d1d1;
            padding: 10px 0 10px 0;
          }

          ul > li {
            display: flex;
            justify-content: space-between;
          }
        `}</style>
      </li>
    );
  };

  return (
    <div className="container">
      <h2>
        {mode === "view"
          ? projectByProjectId.proposalReference
          : mode === "update"
          ? "Editing: " + projectByProjectId.proposalReference
          : "Add a Project"}
      </h2>
      <ol>
        <li>
          <h3>1. Project Overview</h3>
          <ul>
            {getFormListItem(
              "overview",
              getProjectRevisionOverviewFormPageRoute(id),
              "Project overview",
              projectOverviewStatus
            )}
          </ul>
        </li>
        <li>
          <h3>2. Project Details {mode === "update" ? "" : "(optional)"}</h3>
          <ul>
            {getFormListItem(
              "managers",
              getProjectRevisionManagersFormPageRoute(id),
              "Project managers",
              projectManagersStatus
            )}
            {getFormListItem(
              "contacts",
              getProjectRevisionContactsFormPageRoute(id),
              "Project contacts",
              projectContactsStatus
            )}
          </ul>
        </li>
        {mode !== "view" && (
          <li>
            <h3>3. Submit changes</h3>
            <ul>
              {getFormListItem(
                "summary",
                getProjectRevisionPageRoute(id),
                "Review and submit information",
                null
              )}
            </ul>
          </li>
        )}
      </ol>
      <style jsx>{`
        ol {
          list-style: none;
          margin: 0;
        }

        ul {
          list-style: none;
          margin: 0;
        }

        li {
          text-indent: 15px;
          margin-bottom: 0;
        }

        ul > li {
          display: flex;
          justify-content: space-between;
        }

        h2 {
          font-size: 1.25rem;
          margin: 0;
          padding: 20px 0 10px 0;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 15px;
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 15px;
          padding: 10px 0 10px 0;
          margin: 0;
        }

        div :global(a) {
          color: #1a5a96;
        }

        div :global(a:hover) {
          text-decoration: none;
          color: blue;
        }

        div.container {
          background-color: #e5e5e5;
          width: 400px;
        }
      `}</style>
    </div>
  );
};

export default TaskList;
