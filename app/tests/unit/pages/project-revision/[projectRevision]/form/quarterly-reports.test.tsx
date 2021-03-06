import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "pageRoutes";
import { ProjectQuarterlyReportsPage } from "pages/cif/project-revision/[projectRevision]/form/quarterly-reports";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledQuarterlyReportsFormQuery, {
  quarterlyReportsFormQuery,
} from "__generated__/quarterlyReportsFormQuery.graphql";

jest.mock("next/dist/client/router");

/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

const defaultMockResolver = {
  ProjectRevision(context, generateId) {
    return {
      id: `mock-proj-rev-${generateId()}`,
      projectByProjectId: {
        proposalReference: "001",
      },
      projectFormChange: {
        id: `mock-project-form-${generateId()}`,
        newFormData: {
          someProjectData: "test2",
        },
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<quarterlyReportsFormQuery>({
  pageComponent: ProjectQuarterlyReportsPage,
  compiledQuery: compiledQuarterlyReportsFormQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Project Quarterly Reports page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("renders the task list in the left navigation with correct highlighting", () => {
    const router = mocked(useRouter);
    const mockPathname =
      "/cif/project-revision/[projectRevision]/form/quarterly-reports";
    router.mockReturnValue({
      pathname: mockPathname,
    } as any);

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Editing: 001/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Edit quarterly reports/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("redirects the user to the project revision page on submit when editing", () => {
    const router = mocked(useRouter);
    const mockPush = jest.fn();
    router.mockReturnValue({
      push: mockPush,
    } as any);

    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectQuarterlyReportForm"), "default")
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
      .spyOn(require("components/Form/ProjectQuarterlyReportForm"), "default")
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
      getProjectRevisionPageRoute("mock-proj-rev-id")
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
});
