import { render } from "@testing-library/react";
import UserProfile from "components/User/UserProfile";
import { mockRandom } from "jest-mock-random";
import { UserProfile_user } from "__generated__/UserProfile_user.graphql";

beforeEach(() => {
  mockRandom([0.3, 0.1, 0.4, 0.1, 0.5, 0.9]);
});

describe("The UserProfile component", () => {
  it("matches the snapshot", () => {
    const userData: UserProfile_user = {
      emailAddress: "a@a.a",
      fullName: "Full Name",
      " $refType": "UserProfile_user",
    };

    jest
      .spyOn(require("react-relay"), "useFragment")
      .mockImplementation(() => userData);

    const componentUnderTest = render(<UserProfile user={{} as any} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });

  it("returns null if the user is logged out", () => {
    jest
      .spyOn(require("react-relay"), "useFragment")
      .mockImplementation(() => null);

    const componentUnderTest = render(<UserProfile user={null} />);

    expect(componentUnderTest.container.childElementCount).toEqual(0);
  });
});
