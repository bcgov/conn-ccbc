import projectContactSchema from "./projectContactSchema";
import projectReportingRequirementSchema from "./projectReportingRequirementSchema";
import projectManagerSchema from "./projectManagerSchema";
import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import operatorSchema from "./operatorSchema";

const validationSchemas = {
  project_contact: projectContactSchema,
  project_manager: projectManagerSchema,
  //brianna --why is it not project_reporting_requirement?
  reporting_requirement: projectReportingRequirementSchema,
  project: projectSchema,
  contact: contactSchema,
  operator: operatorSchema,
};

export default validationSchemas;
