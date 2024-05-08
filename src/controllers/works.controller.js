const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const prisma = new PrismaClient();

async function sendMessage(req, res) {
  const { workId, destinationUserId, content } = req.body;

  try {
    if (workId) {
      const message = await prisma.message.create({
        data: {
          from: req.user.id,
          to: destinationUserId,
          content: content,
          seen: false,
          workId: workId,
        },
      });
      return res
        .status(200)
        .json({ message: "Message sent successfully", data: message });
    } else {
      const newWork = await prisma.work.create({
        data: {
          clientId: req.user.id,
          taskerId: destinationUserId,
        },
      });

      const message = await prisma.message.create({
        data: {
          from: req.user.id,
          to: destinationUserId,
          content: content,
          seen: false,
          workId: newWork.id,
        },
      });
      return res
        .status(200)
        .json({ message: "Message sent successfully", data: message });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending the message" });
  }
}

async function updateWork(req, res) {
  const workId = parseInt(req.params.id);
  const {
    /* Update fields */
  } = req.body;

  try {
    const updatedWork = await prisma.work.update({
      where: { id: workId },
      data: {
        // Update the fields as needed
      },
    });

    return res
      .status(200)
      .json({ message: "Work updated successfully", data: updatedWork });
  } catch (error) {
    console.error("Error updating work:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the work" });
  }
}

async function deleteWork(req, res) {
  const workId = parseInt(req.params.id);

  try {
    await prisma.message.deleteMany({ where: { workId: workId } });
    await prisma.workReview.deleteMany({ where: { workId: workId } });
    await prisma.work.delete({ where: { id: workId } });

    return res.status(200).json({ message: "Work deleted successfully" });
  } catch (error) {
    console.error("Error deleting work:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the work" });
  }
}

async function createWorkReview(req, res, next) {
  const { workId, rating, comment } = req.body;

  try {
    // Check if the work exists
    const existingWork = await prisma.work.findUnique({
      where: {
        id: workId,
      },
    });

    if (!existingWork) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Work not found" });
    }

    if (existingWork.clientId !== req.user.userId) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "You must be the client included to this work" });
    }
    const newWorkReview = await prisma.workReview.create({
      data: {
        work: {
          connect: {
            id: workId,
          },
        },
        rating,
        comment,
      },
    });

    return res.status(StatusCodes.CREATED).json(newWorkReview);
  } catch (error) {
    next(error)
  }
}

async function deleteWorkReview(req, res, next) {
  const { id: workId, workreviewId } = req.params;

  try {
    // Check if the work review exists
    const existingWorkReview = await prisma.workReview.findUnique({
      where: {
        id: parseInt(workreviewId),
      },
    });

    if (!existingWorkReview) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Work review not found" });
    }

    // Check if the user is authorized to delete the work review
    if (
      existingWorkReview.workId !== parseInt(workId) ||
      (existingWorkReview.userId !== req.user.userId && !req.user.isAdmin)
    ) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "You are not authorized to delete this work review" });
    }

    // Delete the work review
    await prisma.workReview.delete({
      where: {
        id: parseInt(workreviewId),
      },
    });

    return res.status(StatusCodes.OK).json({
        message: "WorkReview deleted successfully.",
      });
  } catch (error) {
    next(error)
}
}

async function updateWorkReview(req, res,next) {
  const { id: workId, workreviewId } = req.params;
  const { rating, comment } = req.body;

  try {
    // Check if the work review exists
    const existingWorkReview = await prisma.workReview.findUnique({
      where: {
        id: parseInt(workreviewId),
      },
    });

    if (!existingWorkReview) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Work review not found" });
    }

    // Check if the user is authorized to update the work review
    if (
      existingWorkReview.workId !== parseInt(workId) ||
      existingWorkReview.userId !== req.user.userId ||
      req.user.role !== "admin"
    ) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "You are not authorized to update this work review" });
    }

    // Update the work review
    const updatedWorkReview = await prisma.workReview.update({
      where: {
        id: parseInt(workreviewId),
      },
      data: {
        rating,
        comment,
      },
    });

    return res.status(StatusCodes.OK).json(updatedWorkReview);
  } catch (error) {
    next(error)
  }
}

module.exports = {
  sendMessage,
  updateWork,
  deleteWork,
  createWorkReview,
  deleteWorkReview,
  updateWorkReview,
};
