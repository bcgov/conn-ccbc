module.exports = {
  options: {
    appendPlugins: [
      "postgraphile-plugin-connection-filter",
      "@graphile-contrib/pg-many-to-many",
      "postgraphile-plugin-upload-field",
      "@graphile-contrib/pg-omit-archived",
      "@graphile-contrib/pg-order-by-related",
    ],
    graphileBuildOptions: {
      connectionFilterAllowNullInput: true,
      connectionFilterRelations: true,
      connectionFilterAllowEmptyObjectInput: true,
      uploadFieldDefinitions: [
        {
          match: ({ schema, table, column, tags }) =>
            table === "attachment" && column === "file",
        },
      ],
    },
  },
};
