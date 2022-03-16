import { getPriorityGroup } from "../../../lib/userGroups";
import { getUserGroups } from "../../helpers/userGroupAuthentication";
import groupData from "../../../data/groups.json";
import { isAuthenticated } from "@bcgov-cas/sso-express";
import type { Request } from "express";
import {
  ENABLE_MOCK_AUTH,
  AS_CIF_INTERNAL,
  AS_CIF_EXTERNAL,
  AS_CIF_ADMIN,
  AS_UNAUTHORIZED_IDIR,
  MOCK_AUTH_COOKIE,
} from "../../args";

const allowCypressForRole = (roleName: string, req: Request) => {
  return ENABLE_MOCK_AUTH && req.cookies?.[MOCK_AUTH_COOKIE] === roleName;
};

const authenticationPgSettings = (req: Request) => {
  if (AS_CIF_INTERNAL || allowCypressForRole("cif_internal", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000000",
      "jwt.claims.user_groups": "cif_internal",
      "jwt.claims.priority_group": "cif_internal",
      role: "cif_internal",
    };
  }

  if (AS_CIF_EXTERNAL || allowCypressForRole("cif_external", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000001",
      "jwt.claims.user_groups": "cif_external",
      "jwt.claims.priority_group": "cif_external",
      role: "cif_external",
    };
  }

  if (AS_CIF_ADMIN || allowCypressForRole("cif_admin", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000002",
      "jwt.claims.user_groups": "cif_admin",
      "jwt.claims.priority_group": "cif_admin",
      role: "cif_admin",
    };
  }

  if (AS_UNAUTHORIZED_IDIR || allowCypressForRole("unauthorized_idir", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000000",
      "jwt.claims.user_groups": "UNAUTHORIZED_IDIR",
      "jwt.claims.priority_group": "UNAUTHORIZED_IDIR",
      role: "ciip_guest",
    };
  }

  const groups = getUserGroups(req);
  const priorityGroup = getPriorityGroup(groups);

  const claimsSettings = {
    role: groupData[priorityGroup].pgRole,
  };
  if (!isAuthenticated(req))
    return {
      ...claimsSettings,
    };

  const claims = req.claims;

  claims.user_groups = groups.join(",");
  claims.priority_group = priorityGroup;

  const properties = [
    "jti",
    "exp",
    "nbf",
    "iat",
    "iss",
    "aud",
    "sub",
    "typ",
    "azp",
    "auth_time",
    "session_state",
    "acr",
    "email_verified",
    "name",
    "preferred_username",
    "given_name",
    "family_name",
    "email",
    "idir_userid",
    "broker_session_id",
    "user_groups",
    "priority_group",
  ];
  properties.forEach((property) => {
    claimsSettings[`jwt.claims.${property}`] = claims[property];
  });

  return {
    ...claimsSettings,
  };
};

export default authenticationPgSettings;
