const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const { user } = require("../models/prismaClient");
const prisma = new PrismaClient();

async function sendMessage(req, res) {
  const { workId, destinationUserId, content, categoryId } = req.body;
  try {
    if (workId) {
      const existingWork = await prisma.work.findUnique({
        where: {
          id: workId,
        },
      });

      console.log(existingWork);
      if (existingWork) {
        const task = await prisma.task.findFirst({
          where: {
            categoryId: parseInt(categoryId),
            taskerId: existingWork.taskerId,
          },
        });

        if (!task) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ error: "The task no longer exists" });
        }

        if (req.user.id === destinationUserId) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: "You cannot send a message to yourself" });
        }

        // Check if the sender is the tasker and if it is the first message for this work
        if (req.user.role === "tasker") {
          const taskerMessageCount = await prisma.message.count({
            where: {
              workId: workId,
              from: req.user.id,
            },
          });

          if (taskerMessageCount === 0) {
            // Update work status to "started"
            await prisma.work.update({
              where: { id: workId },
              data: { status: "started" },
            });
          }
        }

        const message = await prisma.message.create({
          data: {
            from: req.user.id,
            to: parseInt(destinationUserId),
            content: content,
            seen: false,
            workId: workId,
          },
          include: {
            work: true,
          },
        });

        return res
          .status(200)
          .json({ message: "Message sent successfully", data: message });
      } else {
        return res
          .status(404)
          .json({ error: "Work not found with the provided ID" });
      }
    } else {
      let clientId =
        req.user.role == "client"
          ? req.user.id
          : parseInt(destinationUserId);
      let taskerId =
        req.user.role === "tasker"
          ? req.user.id
          : parseInt(destinationUserId);

      const task = await prisma.task.findFirst({
        where: {
          categoryId: parseInt(categoryId),
          taskerId: taskerId,
        },
      });

      if (!task) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "The task no longer exists" });
      }

      const newWork = await prisma.work.create({
        data: {
          clientId: clientId,
          taskerId: taskerId,
          categoryId: parseInt(categoryId),
          status: req.user.role === "tasker" ? "started" : "created", // Initialize status based on the sender
        },
      });

      const message = await prisma.message.create({
        data: {
          from: req.user.id,
          to: parseInt(destinationUserId),
          content: content,
          seen: false,
          workId: newWork.id,
        },
        include: {
          work: true,
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
  const { status } = req.body;

  try {
    const existingWork = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        status: true,
        clientId: true,
        taskerId: true,
        Message: true,
      },
    });

    // Check if the work exists
    if (!existingWork) {
      return res.status(404).json({ error: "Work not found" });
    }


    // Change the status from created to started

    if (existingWork.status === "created" && status === "started") {
      if (
        req.user.role !== "client" ||
        req.user.id !== existingWork.clientId
      ) {
        return res
          .status(403)
          .json({
            error: "You must be a client of this work to start the work",
          });
      }
      // Verify that the tasker has sent at least one message

      if (
        !existingWork.Message.find(
          (element) => element.from === existingWork.taskerId
        )
      ) {
        return res
          .status(400)
          .json({
            error:
              "The tasker must send at least one message before starting the work",
          });
      }
    } else if (existingWork.status === "started" && status === "canceled") {
      if (
        !(req.user.id === existingWork.clientId) &&
        !(req.user.id === existingWork.taskerId)
      ) {
        return res
          .status(403)
          .json({ error: "You must belong to this work to cancled the work" });
      }
    } else if (existingWork.status === "started" && status === "finished") {
      if (!(req.user.id === existingWork.taskerId)) {
        return res
          .status(403)
          .json({ error: "You must be the tasker to update this work" });
      }
    } else if (
      existingWork.status === "finished" &&
      (status === "approved" || status === "canceled")
    ) {
      if (!(req.user.id === existingWork.clientId)) {
        return res
          .status(403)
          .json({ error: "You must be the Client to update this work" });
      }
    } else {
      return res.status(403).json({ error: "Invalid Update " });
    }
    const updatedWork = await prisma.work.update({
      where: { id: workId },
      data: {
        status: status,
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
  const { rating, comment } = req.body;
  const { id: workId } = req.params;

  try { 
    // Check if the work exists
    const existingWork = await prisma.work.findUnique({
      where: {
        id: parseInt(workId),
      }
    });

    if (!existingWork) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Work not found" });
    }

    if (existingWork.status !== "approved") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "This action cannot be completed because the work status is not 'approved'. Only approved work can proceed." });
    }
    

    if (existingWork.clientId !== req.user.id) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "You are not authorized to perform this action. Only the client associated with this work can proceed." });
    }
    const newWorkReview = await prisma.workReview.create({
      data: {
        work: {
          connect: {
            id: parseInt(workId),
          },
        },
        rating : parseInt(rating) ,
        comment
      },
    });
    
    const task = await prisma.task.findFirst({
      where: {
          categoryId: existingWork.categoryId,
          taskerId: existingWork.taskerId,
      },
      select: {
        reviewsCount: true,
        ratingAverage: true,
      }
    });

    const newReviewsCount = task.reviewsCount + 1;
    const newRatingAverage = ((task.ratingAverage * task.reviewsCount) + parseFloat(rating)) / newReviewsCount;

    await prisma.task.updateMany({
      where: {
          categoryId: existingWork.categoryId,
          taskerId: existingWork.taskerId,
      },
      data: {
        reviewsCount: newReviewsCount,
        ratingAverage: newRatingAverage,
      }
    });

    return res.status(StatusCodes.CREATED).json(newWorkReview);
  } catch (error) {
    console.log(error);
    next(error);
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
      select:{
        work:{
          select:{
            status:true,
            clientId:true
          }
        },
        workId:true,
      }
    });

    if (!existingWorkReview) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Work review not found" });
    }

    if (existingWorkReview.work.status !== "approved") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "This action cannot be completed because the work status is not 'approved'. Only approved work can proceed." });
    }
    
    // Check if the user is authorized to delete the work review
    if (
      (existingWorkReview.workId !== parseInt(workId) ||
      existingWorkReview.work.clientId !== req.user.id) &&
      req.user.role !== "admin"
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
    next(error);
  }
}

async function updateWorkReview(req, res, next) {
  const { id: workId, workreviewId } = req.params;
  const { rating, comment } = req.body;

  try {
    // Check if the work review exists
    const existingWorkReview = await prisma.workReview.findUnique({
      where: {
        id: parseInt(workreviewId),
      },
      select:{
        work:{
          select:{
            status:true,
            clientId:true
          }
        },
        workId:true,
      }
    });

    if (!existingWorkReview) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Work review not found" });
    }

    if (existingWorkReview.work.status !== "approved") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "This action cannot be completed because the work status is not 'approved'. Only approved work can proceed." });
    }

    // Check if the user is authorized to update the work review

    if (
      (existingWorkReview.workId !== parseInt(workId) ||
      existingWorkReview.work.clientId !== req.user.id) &&
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
    next(error);
  }
}


async function getMyWorks(req,res,next) {
  try {
    const user = req.user
    const userId = req.user.id
    // Get the works where the current user is the client
    if(user.role === "client")
    {
      const clientWorks = await prisma.work.findMany({
        where: {
          clientId: userId,
        },
        include: {
          category:true,
          tasker: {
            include: {
              User: {
                select: {
                  firstName: true, 
                  lastName: true,
                  email : true , 
                  id: true
                },
              },
            },
          },
        },
        orderBy: {
          id: 'desc', // Order by id in descending order
        },
      });
      return res.status(StatusCodes.OK).json(clientWorks);

    }
    else{
      const taskerWorks = await prisma.work.findMany({
        where: {
          taskerId: userId,
        },
        include: {
          category:true,
          client: {
            include: {
              User: {
                select: {
                  firstName: true, 
                  lastName: true,
                  email : true , 
                  id: true
                },
              },
            },
          },
        },
        orderBy: {
          id: 'desc', // Order by id in descending order
        },
      });
      return res.status(StatusCodes.OK).json(taskerWorks);

    }
  } catch (error) {
    next(error);
  }
}

async function SearchInMyWorks(req, res, next) {
  try {
    const user = req.user;
    const userId = req.user.id;
    const { search } = req.query;

    // Construct the search filter
    const searchFilter = search
      ? {
          OR: [
            { tasker: { User: { firstName: { contains: search, mode: 'insensitive' } } } },
            { client: { User: { firstName: { contains: search, mode: 'insensitive' } } } }
          ]
        }
      : {};

    let works;
    if (user.role === 'client') {
      works = await prisma.work.findMany({
        where: {
          clientId: userId,
          ...searchFilter
        },
        include: {
          category: true,
          tasker: {
            include: {
              User: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  id: true
                }
              }
            }
          }
        }
      });
    } else {
      works = await prisma.work.findMany({
        where: {
          taskerId: userId,
          ...searchFilter
        },
        include: {
          category: true,
          client: {
            include: {
              User: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  id: true
                }
              }
            }
          }
        }
      });
    }

    return res.status(StatusCodes.OK).json(works);
  } catch (error) {
    next(error);
  }
}
const getMessagesByWork = async (req, res, next) => {
  const userId = req.user.id; // Assuming user ID is available in the request object
  const workId = parseInt(req.params.id); 

  try {
    const messages = await prisma.message.findMany({
      where: {
        workId: workId,
      },
      select: {
        id: true,
        from: true,
        to: true,
        content: true,
        seen: true,
      }
    });

    // Add a custom field is_sender to each message
    const messagesWithIsSender = messages.map(message => {
      return {
        ...message,
        is_sender: message.from === userId
      };
    });

    res.status(200).json(messagesWithIsSender);
  } catch (error) {
    console.error("Error retrieving messages by work ID:", error);
    res.status(500).json({ error: "An error occurred while retrieving messages" });
  }
};
module.exports = {
  sendMessage,
  updateWork,
  deleteWork,
  createWorkReview,
  deleteWorkReview,
  updateWorkReview,
  getMyWorks,
  getMessagesByWork,
  SearchInMyWorks
};
