export const getProjectsPageRoute = () => ({
  pathname: "/cif/projects/",
});

export const getOperatorsPageRoute = () => ({
  pathname: "/cif/operators/",
});

export const getContactsPageRoute = () => ({
  pathname: "/cif/contacts/",
});

export const getProjectRevisionPageRoute = (projectRevisionId: string) => ({
  pathname: `/cif/project-revision/[projectRevision]/`,
  query: {
    projectRevision: projectRevisionId,
  },
});