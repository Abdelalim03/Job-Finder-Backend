import ModerationApi from "@moderation-api/sdk";

const moderationApi = new ModerationApi({
  key: process.env.MODERATIONAPIKEY,
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
      return true;
    } else {
      // Add to database etc.
      return false;
    }
  } catch (error) {
    next(error);
  }
}

module.exports = { classifyText };
