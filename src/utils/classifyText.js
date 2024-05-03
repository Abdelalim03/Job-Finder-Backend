import ModerationApi from "@moderation-api/sdk";

const moderationApi = new ModerationApi({
  key: "proj_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MzRlYTNkZTMwZjUxNjU0N2JjY2ExMiIsInVzZXJJZCI6IjY2MzRlOWRhMTlhNzk4YzU1OGE4ZTkzMCIsInRpbWVzdGFtcCI6MTcxNDc0Mzg2OTE3NiwiaWF0IjoxNzE0NzQzODY5fQ.s73SpkLNYADgb9KivDupO3Dzcb60DKmZ5NpW7U7sFGI",
});

async function classifyText(text) {
    try {
        const analysis = await moderationApi.moderate.text({
            value: text,
            // Optional content data
            // authorId: "123",
            // contextId: "456",
            // metadata: {
            //   customField: "value",
            // },
          });
          
          if (analysis.flagged) {
            // Return error to user etc.
            return true
          } else {
            // Add to database etc.
            return fa
          }
  
      
    } catch (error) {
      next(error);
    }
  }
  
  module.exports = { classifyText };
  
