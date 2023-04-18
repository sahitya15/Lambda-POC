const axios = require('axios');
const FormData = require('form-data');
const moment = require("moment");
const { createConnection } = require('./dbConnection');


exports.handler = async (event) => {

  console.log("Event-RDS", event);

const username = 'mushahid.ansari@teqfocus.com';
const password = 'Teqfocus@2233Bj30dUwrqxLu93lOjwZgFvcS';
const clientId = '3MVG96mGXeuuwTZjghtl0lzmaJhQwjyr93sFCR6DBjkVaNjpZz7m9sd2v_k8L92lQLaFeqD.K8QOYETXUx9B9';
const clientSecret = 'A9D0E570DDC6BFC4B877520F101E823697BDDB92A1E47DAAEFB02A8362998D69';
const instanceUrl = 'https://alu--eda10.sandbox.my.salesforce.com';


const formData = new FormData();
formData.append('grant_type', 'password');
formData.append('client_id', clientId);
formData.append('client_secret', clientSecret);
formData.append('username', username);
formData.append('password', password);

try {
    // Step 1: Authenticate with Salesforce using OAuth
  let accessToken = '';
  const response = await axios.post(`${instanceUrl}/services/oauth2/token`, formData);
  accessToken = response.data.access_token;
  console.log('accessToken', accessToken);;

  // Step 2: Create a Contact record using the Salesforce REST API
  const pgSql = await createConnection();
  const sql = `SELECT assignment_groups,total,course_id FROM canvas_assignments WHERE user_id = '1558';`
  const assignments = await pgSql.query(sql);
  //close connection
  await pgSql.end();
  let summative_assignemnt = {};
  let formative_assignment = {};

  const assignment_1 = assignments.rows[0].assignment_groups[0];//summative
  const assignment_2 = assignments.rows[0].assignment_groups[1];//formative
  console.log(assignment_1);
  console.log(assignment_2);

  if(assignment_1.name == "Summative Assessments") {
    summative_assignemnt = assignments.rows[0].assignment_groups[0];
  } else if (assignment_2.name == "Summative Assessments") {
    summative_assignemnt = assignments.rows[0].assignment_groups[1];
  }

  if (assignment_1.name == "Formative Assessments") {
    formative_assignment = assignments.rows[0].assignment_groups[0];
  } else if(assignment_2.name == "Formative Assessments") {
    formative_assignment = assignments.rows[0].assignment_groups[1];
  }
  console.log("summative_assignemnt",summative_assignemnt);
  console.log("formative_assignment", formative_assignment);
  const course_id = assignments.rows[0].course_id;
  const gradeData = {
        "updatedCourses": [
          {
            "Id": "a055E00000Et1UgQAJ",
            "Formative_Group_Weight__c": formative_assignment.group_weight,
            "Formative_Group_Grade__c": formative_assignment.groupGrade,
            "Summative_Group_Weight__c": summative_assignemnt.group_weight,
            "Summative_Group_Grade__c": summative_assignemnt.groupGrade,
            "Total__c": assignments.rows[0].total
          }
        ] 
  };
  console.log('GradeData', gradeData);

  // const userid = '1558';
  // const getresponse = await axios.get(`${instanceUrl}/services/apexrest/courses`, gradeData);
  // console.log('GetResponse', getresponse);
  let setResponse;
  //   if(getresponse) {
      setResponse = await axios.put(`${instanceUrl}/services/apexrest/courses`, gradeData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000 // set the timeout to 20 seconds
      })
        .then(response => {
          console.log('Grade updated:', response.data);
        })
        .catch(error => {
          console.error('Error creating Contact:', error.response.data);
        });
  //   } else {
  //     setResponse = await axios.post(`${instanceUrl}/services/apexrest/grades`, gradeData, {
  //       headers: {
  //         'Authorization': `Bearer ${accessToken}`,
  //         'Content-Type': 'application/json'
  //       },
  //       timeout: 20000 // set the timeout to 20 seconds
  //     })
  //       .then(response => {
  //         console.log('Contact created:', response.data);
  //       })
  //       .catch(error => {
  //         console.error('Error creating Contact:', error.response.data);
  //       });
  //   }
    return setResponse.data;
  } catch (error) {
    console.log(error);
    return error;
  }

};
sahitya
