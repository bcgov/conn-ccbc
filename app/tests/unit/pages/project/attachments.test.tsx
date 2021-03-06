import { screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import { ProjectAttachments } from "pages/cif/project/[project]/attachments";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledAttachmentsQuery, {
  attachmentsQuery,
} from "__generated__/attachmentsQuery.graphql";

jest.mock("next/dist/client/router");

const defaultQueryResolver = {
  Query() {
    return {
      project: {
        id: "test-cif-project",
        projectName: "Test CIF Project",
      },
      allAttachments: {
        totalCount: 2,
        edges: [
          {
            node: {
              file: "test-file-1",
            },
          },
          {
            node: {
              file: "test-file-2",
            },
          },
        ],
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<attachmentsQuery>({
  pageComponent: ProjectAttachments,
  compiledQuery: compiledAttachmentsQuery,
  defaultQueryResolver: defaultQueryResolver,
  defaultQueryVariables: { project: "test-cif-project" },
});

describe("The project's attachment page", () => {
  beforeEach(() => {
    jest.resetModules();
    pageTestingHelper.reinit();
  });
  it("renders a table with all the attachments", () => {
    mocked(useRouter).mockReturnValue({
      query: {},
    } as any);

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    // 5 rows: 1 header, 1 filter, 1 for the pagination, and 2 for the attachments
    expect(screen.getAllByRole("row")).toHaveLength(5);
  });
  it("has a button to upload an attachment", () => {
    const mockPush = jest.fn();
    mocked(useRouter).mockReturnValue({
      query: {},
      push: mockPush,
    } as any);

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    screen.getByText("Upload New Attachment").click();

    expect(mockPush).toHaveBeenCalledWith(
      "/cif/project/[project]/upload-attachment?project=test-cif-project",
      expect.anything(),
      expect.anything()
    );
  });
});
