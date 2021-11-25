import React from "react";
import {
  CreateProject,
  CreateProjectQuery,
} from "../../../pages/cif/create-project";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import { createProjectQuery } from "__generated__/createProjectQuery.graphql";

const environment = createMockEnvironment();

environment.mock.queueOperationResolver((operation) => {
  return MockPayloadGenerator.generate(operation, {
    createProjectQuery() {
      return {
        query: {
          session: null,
          formChange: {
            id: "mock-id",
            newFormData: {
              cif_identifier: "",
              description: "",
            },
          },
        },
      };
    },
  });
});

const query = CreateProjectQuery; // can be the same, or just identical
const variables = {
  id: "mock-id",
};
environment.mock.queuePendingOperation(query, variables);

describe("The Create Project page", () => {
  const initialQueryRef = loadQuery<createProjectQuery>(
    environment,
    CreateProjectQuery,
    { id: "mock-id" }
  );

  it("loads the Create Project Button", async () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="1"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.getAllByRole("button")[1]).toHaveTextContent("Submit");
    expect(screen.getAllByRole("textbox")[0]).toHaveTextContent("");
  });

  it("calls the updateFormChange mutation when the user types", async () => {
    const spy = jest
      .spyOn(require("mutations/FormChange/updateFormChange"), "default")
      .mockImplementation(() => "updated");
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="2"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: 123 },
    });
    expect(screen.getAllByRole("textbox")[0].value).toEqual("123");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("calls the updateFormChange mutation when the Submit Button is clicked & input values are valid", async () => {
    const spy = jest
      .spyOn(require("mutations/FormChange/updateFormChange"), "default")
      .mockImplementation(() => {});
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="3"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    fireEvent.change(screen.getByLabelText("CIF Identifier*"), {
      target: { value: 123 },
    });
    fireEvent.change(screen.getByLabelText("Description*"), {
      target: { value: "test project" },
    });
    userEvent.click(screen.getAllByRole("button")[1]);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("does not call the updateFormChange mutation when the Submit Button is clicked & input values are invalid", async () => {
    const spy = jest
      .spyOn(require("mutations/FormChange/updateFormChange"), "default")
      .mockImplementation(() => {});
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="4"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    userEvent.click(screen.getAllByRole("button")[1]);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});