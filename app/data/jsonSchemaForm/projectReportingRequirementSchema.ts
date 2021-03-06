const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Reporting Requirement",
  required: ["reportDueDate"],
  properties: {
    reportDueDate: {
      type: "string",
      title: "Report Due Date",
      default: undefined,
    },
    submittedDate: {
      type: "string",
      title: "Received Date",
      default: undefined,
    },
    comments: {
      type: "string",
      title: "General Comments",
    },
  },
};

export default schema;
