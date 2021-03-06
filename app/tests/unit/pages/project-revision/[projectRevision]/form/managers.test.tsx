import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import {
  getProjectRevisionContactsFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { ProjectManagersForm } from "pages/cif/project-revision/[projectRevision]/form/managers";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledManagersFormQuery, {
  managersFormQuery,
} from "__generated__/managersFormQuery.graphql";
import { ProjectManagerForm_query$data } from "__generated__/ProjectManagerForm_query.graphql";

jest.mock("next/router");

/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

const defaultMockResolver = {
  ProjectRevision(_, generateId) {
    return {
      id: `mock-proj-rev-${generateId()}`,
      projectByProjectId: {
        proposalReference: "001",
      },
      projectFormChange: {
        id: `mock-project-form--${generateId()}`,
        newFormData: {
          someProjectData: "test2",
        },
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<managersFormQuery>({
  pageComponent: ProjectManagersForm,
  compiledQuery: compiledManagersFormQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Project Managers form page", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    pageTestingHelper.reinit();
  });

  it("renders the task list in the left navigation", () => {
    const router = mocked(useRouter);
    const mockPathname =
      "/cif/project-revision/[projectRevision]/form/managers";
    router.mockReturnValue({
      pathname: mockPathname,
    } as any);
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Editing: /i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Edit project managers/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("undoes all changes (resets the form to empty) when the user clicks the Undo Changes button while adding a new project", () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-manager-id",
          managerFormChanges: {
            edges: [
              {
                node: {
                  formChange: {
                    id: "formChange-1",

                    changeStatus: "pending",
                    newFormData: {
                      cifUserId: 1,
                      projectId: 2,
                      projectManagerLabelId: 1,
                    },
                    formChangeByPreviousFormChangeId: null,
                  },
                  projectManagerLabel: {
                    id: "pm-label-1",
                    rowId: 1,
                    label: "Tech Team Primary",
                  },
                  " $fragmentSpreads": null,
                },
              },
              {
                node: {
                  formChange: null,
                  projectManagerLabel: {
                    id: "pm-label-2",
                  },
                },
              },
              {
                node: {
                  formChange: null,
                  projectManagerLabel: {
                    id: "pm-label-3",
                  },
                },
              },
              {
                node: {
                  formChange: null,
                  projectManagerLabel: {
                    id: "pm-label-4",
                  },
                },
              },
            ],
          },
          projectFormChange: {
            formDataRecordId: 2,
          },
        };
      },
      Query() {
        const cifUsersQuery: Partial<ProjectManagerForm_query$data> = {
          allCifUsers: {
            edges: [
              {
                node: {
                  rowId: 1,
                  fullName: "Knope, Leslie",
                },
              },
              {
                node: {
                  rowId: 2,
                  fullName: "Swanson, Ron",
                },
              },
              {
                node: {
                  rowId: 3,
                  fullName: "Ludgate, April",
                },
              },
            ],
          },
        };
        return cifUsersQuery;
      },
    });
    pageTestingHelper.renderPage();
    expect(screen.getByLabelText(/Tech Team Primary/i)).toHaveValue(
      "Knope, Leslie"
    );

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(pageTestingHelper.environment.mock.getAllOperations()).toHaveLength(
      2
    );

    const mutationUnderTest =
      pageTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "updateProjectManagerFormChangeMutation"
    );

    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangePatch: {
          changeStatus: "pending",
          newFormData: {},
        },
      },
    });
  });

  it("undoes all changes (resets the form to the previous committed data) when the user clicks the Undo Changes button while editing an existing project", () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-manager-id",
          managerFormChanges: {
            edges: [
              {
                node: {
                  formChange: {
                    id: "formChange-1",
                    operation: "UPDATE",
                    changeStatus: "pending",
                    newFormData: {
                      cifUserId: 1,
                      projectId: 2,
                      projectManagerLabelId: 1,
                    },
                    formChangeByPreviousFormChangeId: {
                      changeStatus: "committed",
                      newFormData: {
                        cifUserId: 2,
                        projectId: 2,
                        projectManagerLabelId: 1,
                      },
                    },
                  },
                  projectManagerLabel: {
                    id: "pm-label-1",
                    rowId: 1,
                    label: "Tech Team Primary",
                  },
                  " $fragmentSpreads": null,
                },
              },
              {
                node: {
                  formChange: null,
                  projectManagerLabel: {
                    id: "pm-label-2",
                  },
                },
              },
              {
                node: {
                  formChange: null,
                  projectManagerLabel: {
                    id: "pm-label-3",
                  },
                },
              },
              {
                node: {
                  formChange: null,
                  projectManagerLabel: {
                    id: "pm-label-4",
                  },
                },
              },
            ],
          },
          projectFormChange: {
            formDataRecordId: 2,
          },
        };
      },
      Query() {
        const cifUsersQuery: Partial<ProjectManagerForm_query$data> = {
          allCifUsers: {
            edges: [
              {
                node: {
                  rowId: 1,
                  fullName: "Knope, Leslie",
                },
              },
              {
                node: {
                  rowId: 2,
                  fullName: "Swanson, Ron",
                },
              },
              {
                node: {
                  rowId: 3,
                  fullName: "Ludgate, April",
                },
              },
            ],
          },
        };
        return cifUsersQuery;
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByLabelText(/Tech Team Primary/i)).toHaveValue(
      "Knope, Leslie"
    );

    userEvent.click(screen.getByText(/Undo Changes/i));
    expect(pageTestingHelper.environment.mock.getAllOperations()).toHaveLength(
      2
    );

    const mutationUnderTest =
      pageTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "updateProjectManagerFormChangeMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangePatch: {
          changeStatus: "pending",
          newFormData: {
            cifUserId: 2,
            projectId: 2,
            projectManagerLabelId: 1,
          },
        },
      },
    });
  });

  it("redirects the user to the project revision page on submit when editing", () => {
    const router = mocked(useRouter);
    const mockPush = jest.fn();
    router.mockReturnValue({
      push: mockPush,
    } as any);

    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectManagerFormGroup"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    handleSubmit();
    expect(mockPush).toHaveBeenCalledWith(
      getProjectRevisionPageRoute("mock-proj-rev-2")
    );
  });

  it("redirects the user to the project revision page on submit when creating a project", () => {
    const router = mocked(useRouter);
    const mockPush = jest.fn();
    router.mockReturnValue({
      push: mockPush,
    } as any);

    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectManagerFormGroup"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });

    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectId: null,
          projectByProjectId: null,
          projectFormChange: null,
        };
      },
    });
    pageTestingHelper.renderPage();
    handleSubmit();
    expect(mockPush).toHaveBeenCalledWith(
      getProjectRevisionContactsFormPageRoute("mock-proj-rev-id")
    );
  });

  it("renders null and redirects to a 404 page when a revision doesn't exist", async () => {
    const mockReplace = jest.fn();
    mocked(useRouter).mockReturnValue({
      replace: mockReplace,
    } as any);

    pageTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });

    const { container } = pageTestingHelper.renderPage();

    expect(container.childElementCount).toEqual(0);
    expect(mockReplace).toHaveBeenCalledWith("/404");
  });

  it("renders the form in view mode when the project revision is committed", async () => {
    jest.mock("next/router");
    const routerPush = jest.fn();
    mocked(useRouter).mockReturnValue({ push: routerPush } as any);

    pageTestingHelper.loadQuery({
      ProjectRevision(context) {
        return {
          id: context.path.includes("pendingProjectRevision")
            ? "mock-pending-revision-id"
            : "mock-base-revision-id",
          isFirstRevision: true,
          projectByProjectId: {
            latestCommittedProjectRevision: {
              id: "mock-manager-1",
            },
          },
          changeStatus: "committed",
          allProjectManagerFormChangesByLabel: {
            edges: [
              {
                node: {
                  formChange: {
                    newFormData: {
                      cifUserId: 1,
                      projectId: 2,
                      projectManagerLabelId: 1,
                    },
                    asProjectManager: {
                      cifUserByCifUserId: {
                        fullName: "test manager 1",
                      },
                    },
                  },
                  projectManagerLabel: {
                    label: "Test Label 1",
                  },
                },
              },
              {
                node: {
                  formChange: {
                    newFormData: {
                      cifUserId: 2,
                      projectId: 2,
                      projectManagerLabelId: 2,
                    },
                    asProjectManager: {
                      cifUserByCifUserId: {
                        fullName: "test manager 2",
                      },
                    },
                  },
                  projectManagerLabel: {
                    label: "Test Label 2",
                  },
                },
              },
              {
                node: {
                  formChange: {
                    newFormData: {
                      cifUserId: 3,
                      projectId: 2,
                      projectManagerLabelId: 3,
                    },
                    asProjectManager: {
                      cifUserByCifUserId: {
                        fullName: "test manager 3",
                      },
                    },
                  },
                  projectManagerLabel: {
                    label: "Test Label 3",
                  },
                },
              },
            ],
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(
      screen.queryByRole("button", { name: "submit" })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Test Label 1/i).nextSibling).toHaveTextContent(
      "test manager 1"
    );
    expect(screen.getByText(/Test Label 2/i).nextSibling).toHaveTextContent(
      "test manager 2"
    );
    expect(screen.getByText(/Test Label 3/i).nextSibling).toHaveTextContent(
      "test manager 3"
    );
    userEvent.click(screen.getByRole("button", { name: /resume edition/i }));
    expect(routerPush).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/managers/",
      query: { projectRevision: "mock-pending-revision-id" },
    });
  });
});
