const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const prisma = new PrismaClient();

async function sendMessage(req, res) {
    const { workId, destinationUserId, content ,categoryId} = req.body;
    try {
        if (parseInt(workId)) {
            const existingWork = await prisma.work.findUnique({
                where: {
                    id: parseInt(workId),
                },
            });

            
            if (existingWork) {
                if ([existingWork.clientId, existingWork.taskerId].sort().join(',') !== [req.user.userId, destinationUserId].sort().join(',')) {
                    return res.status(StatusCodes.FORBIDDEN).json({ error: 'You must belong to this work' });
                }
                if (req.user.userId=== destinationUserId){
                    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'You cannot send a message to yourself' });
                }


                const message = await prisma.message.create({
                    data: {
                        from: req.user.userId,
                        to: parseInt(destinationUserId),
                        content: content,
                        seen: false,
                        workId: parseInt(workId),
                    },
                });
                return res.status(200).json({ message: "Message sent successfully", data: message });
            } else {
                return res.status(404).json({ error: "Work not found with the provided ID" });
            }
        } else {
            let clientId =  (req.user.role == "client" ) ? req.user.userId : parseInt(destinationUserId)
            let taskerId = (req.user.role === "tasker") ? req.user.userId : parseInt(destinationUserId)
            const newWork = await prisma.work.create({
                data: {
                    clientId: clientId,
                    taskerId:  taskerId,
                    categoryId : parseInt(categoryId)
                },
            });

            const message = await prisma.message.create({
                data: {
                    from: req.user.userId,
                    to: parseInt(destinationUserId),
                    content: content,
                    seen: false,
                    workId: newWork.id,
                },
            });
            return res.status(200).json({ message: "Message sent successfully", data: message });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "An error occurred while sending the message" });
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
                status : true,
                clientId : true,
                taskerId : true,
                Message: true,
            },
        });

        // Check if the work exists
        if (!existingWork) {
            return res.status(404).json({ error: "Work not found" });
        }


        // Change the status from created to started 

        if (existingWork.status === "created" && status === "started") {
            if (req.user.role !== "client" || req.user.userId !== existingWork.clientId) {
                return res.status(403).json({ error: "You must be a client of this work to start the work" });
            }
            // Verify that the tasker has sent at least one message
            
            if (! (existingWork.Message.find(element => element.from === existingWork.taskerId)) ) {
                return res.status(400).json({ error: "The tasker must send at least one message before starting the work" });
            }
        }
        else if(existingWork.status === "started" && status === "canceled"){
            if( !(req.user.userId === existingWork.clientId) && !(req.user.userId === existingWork.taskerId))
            {
                return res.status(403).json({ error: "You must belong to this work to cancled the work" });
            }

        }
        else if(existingWork.status === "started" && status === "finished")
        {
            if( !(req.user.userId === existingWork.taskerId) )
            {
                return res.status(403).json({ error: "You must be the tasker to update this work" });
            }
        }
        else if(existingWork.status === "finished" && (status === "approved" || status === "canceled"))
        {
            if( !(req.user.userId === existingWork.clientId) )
            {
                return res.status(403).json({ error: "You must be the Client to update this work" });
            }
        }
        else {
            return res.status(403).json({ error: "Invalid Update " });

        }
        const updatedWork = await prisma.work.update({
            where: { id: workId },
            data: {
                status: status,
            },
        });

        return res.status(200).json({ message: "Work updated successfully", data: updatedWork });
    } catch (error) {
        console.error("Error updating work:", error);
        return res.status(500).json({ error: "An error occurred while updating the work" });
    }

}

async function deleteWork(req, res) {
    const workId = parseInt(req.params.id);

    try {
        await prisma.work.delete({ where: { id: workId } });
 
        return res.status(200).json({ message: "Work deleted successfully" });
    } catch (error) {
        console.error("Error deleting work:", error);
        return res.status(500).json({ error: "An error occurred while deleting the work" });
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
      },
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
    

    if (existingWork.clientId !== req.user.userId) {
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
      existingWorkReview.work.clientId !== req.user.userId) &&
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
      existingWorkReview.work.clientId !== req.user.userId) &&
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
